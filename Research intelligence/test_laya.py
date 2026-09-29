from laya import Router

# Preload checkpoints into memory for instant sub-35ms routing
print("Loading Laya Router...")
router = Router(preload=True)

# Example document chunk from your thesis bank
state = {
    "document_type": "thesis_chunk",
    "text": "This is an open access article licensed under the Creative Commons BY-NC-ND License. The author claims this is entirely original work, but it matches 95% of the text from a 2019 paper by Wang et al."
}

# Define the typed decisions we want Laya to make in a SINGLE forward pass
questions = {
    "plagiarism_risk": {
        "type": "noul", # yes/no with probability
        "instructions": "Does this text indicate a high risk of plagiarism or unoriginal work?"
    },
    "routing_category": {
        "type": "choice",
        "instructions": "Which system should handle this chunk?",
        "criteria": {
            "plagiarism_engine": "Flags duplicate or highly similar text",
            "rag_assistant": "Normal academic text for Q&A",
            "metadata_extractor": "Contains titles, authors, or citations"
        }
    },
    "confidence_score": {
        "type": "score",
        "instructions": "How confident are we in this classification?",
        "criteria": ["low", "medium", "high"]
    }
}

print("\nRunning Laya decision model...\n")
result = router.predict(state, questions)

print("Plagiarism Risk (Yes/No Prob):", result["answers"]["plagiarism_risk"]["noul"])
print("Routing Category            :", result["answers"]["routing_category"]["choice"])
print("Confidence Score            :", result["answers"]["confidence_score"]["score"])
print("Model Used                  :", result["routing"]["model"])