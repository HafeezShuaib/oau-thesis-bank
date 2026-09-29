import tiktoken
import structlog

logger = structlog.get_logger()

class TokenChunker:
    def __init__(self, chunk_size: int = 512, overlap: int = 50, encoding_name: str = "cl100k_base"):
        self.chunk_size = chunk_size
        self.overlap = overlap
        self.encoder = tiktoken.get_encoding(encoding_name)

    def chunk_text(self, text: str) -> list[tuple[str, int]]:
        if not text.strip():
            return []
            
        tokens = self.encoder.encode(text)
        chunks = []
        start = 0
        
        while start < len(tokens):
            end = start + self.chunk_size
            chunk_tokens = tokens[start:end]
            chunk_text = self.encoder.decode(chunk_tokens)
            chunks.append((chunk_text, len(chunk_tokens)))
            
            if end >= len(tokens):
                break
            start += self.chunk_size - self.overlap
            
        return chunks
