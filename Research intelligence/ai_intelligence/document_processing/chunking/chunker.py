from dataclasses import dataclass
import re

@dataclass
class Chunk:
    text: str
    index: int

def normalize_text(text: str) -> str:
    text = text.replace("\u00ad", "")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()

def chunk_text(text: str, size=512, overlap=50):
    words = normalize_text(text).split()
    if not words: return []
    step=max(1, size-overlap)
    return [Chunk(" ".join(words[i:i+size]), n) for n,i in enumerate(range(0,len(words),step)) if words[i:i+size]]
