import sys
import psycopg
from sentence_transformers import SentenceTransformer
from inference_router import evaluate_decision, generate_with_fallback

print("Loading embedding model...")
embed_model = SentenceTransformer('BAAI/bge-large-en-v1.5')

def retrieve_context(query: str, top_k: int = 3):
    instruction = "Represent this sentence for searching relevant passages: "
    query_embedding = embed_model.encode([instruction + query], normalize_embeddings=True)[0]
    vector_str = f"[{','.join(map(str, query_embedding.tolist()))}]"
    
    conn = psycopg.connect("postgresql://oau_user:password123@localhost:5433/oau_thesis_bank")
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT page, chunk_index, text, 1 - (embedding <=> %s::vector) as similarity
        FROM document_chunks
        WHERE embedding IS NOT NULL
        ORDER BY embedding <=> %s::vector
        LIMIT %s;
    """, (vector_str, vector_str, top_k))
    
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    
    context = ""
    for page, idx, text, sim in results:
        context += f"[Page {page}, Chunk {idx}] (Similarity: {sim:.2f}):\n{text}\n\n"
        
    return context

if __name__ == "__main__":
    query = sys.argv[1] if len(sys.argv) > 1 else "What does the text say about insufficient knowledge and resources?"
    
    print(f"\n🛡️ Step 1: Evaluating query with Laya Decision Layer...\n")
    decision = evaluate_decision({"text": query})
    jailbreak_prob = decision["answers"]["is_jailbreak"]["noul"]
    
    if jailbreak_prob > 0.8:
        print(f"🚫 BLOCKED: Request flagged as malicious (Jailbreak Probability: {jailbreak_prob:.2%})")
        sys.exit(0)
        
    print(f"✅ PASSED: Query is safe (Jailbreak Probability: {jailbreak_prob:.2%})\n")

    print("🔍 Step 2: Searching database for relevant context...\n")
    context = retrieve_context(query, top_k=3)
    
    if not context:
        print("❌ No relevant chunks found.")
        sys.exit(0)

    system_prompt = """You are an expert academic research assistant. 
Answer the user's question based *only* on the provided context. 
If the answer is not in the context, say "I cannot find the answer in the provided document."
Always cite the specific Page number(s)."""

    user_prompt = f"Context:\n{context}\n\nQuestion: {query}"

    print("-" * 60)
    print("🤖 Step 3: Generating answer via Local LM Studio...\n")
    answer = generate_with_fallback(system_prompt, user_prompt)
    print("LLM Raw Answer:\n", answer)
    
    print("\n🛡️ Step 4: Output Grounding Check (Hallucination Prevention)...\n")
    
    # OUTPUT GUARDRAIL: Check if the LLM's answer is actually supported by the context
    grounding_check = evaluate_decision({
        "context": context,
        "llm_answer": answer
    })
    
    # We ask Laya a specific grounding question
    # Note: We temporarily override the default questions for this specific check
    from inference_router import decision_router
    grounding_result = decision_router.predict(
        state={"context": context, "llm_answer": answer},
        questions={
            "is_grounded": {
                "type": "noul",
                "instructions": "Is the LLM's answer fully supported by the provided context, without adding outside information or hallucinating?"
            }
        }
    )
    
    grounded_prob = grounding_result["answers"]["is_grounded"]["noul"]
    print(f"Grounding Probability: {grounded_prob:.2%}")
    
    if grounded_prob < 0.70:
        print("⚠️ WARNING: LLM answer failed grounding check. Overriding with safe response.")
        final_answer = "I cannot verify this information from the provided thesis documents."
    else:
        print("✅ PASSED: Answer is grounded in the retrieved context.")
        final_answer = answer

    print("-" * 60)
    print("✅ FINAL SAFE ANSWER:\n")
    print(final_answer)
    print("-" * 60)