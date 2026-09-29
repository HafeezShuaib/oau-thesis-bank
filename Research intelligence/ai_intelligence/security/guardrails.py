import re
from dataclasses import dataclass

@dataclass
class GuardrailVerdict:
    allowed: bool
    reason: str
    risk: str = "low"

INJECTION_PATTERNS = [
    r"ignore (all|any|the) (previous|above|prior) instructions",
    r"system prompt",
    r"developer message",
    r"reveal (your|the) instructions",
    r"jailbreak",
    r"disregard.*instructions",
]

def inspect_text(text: str, source="user") -> GuardrailVerdict:
    lowered = text.lower()
    for p in INJECTION_PATTERNS:
        if re.search(p, lowered):
            return GuardrailVerdict(False, f"Potential prompt injection detected in {source} content", "high")
    return GuardrailVerdict(True, "No known injection pattern detected", "low")

def sanitize_retrieved(text: str) -> str:
    # Retrieved documents are DATA. Explicit instruction-like lines are neutralized.
    lines=[]
    for line in text.splitlines():
        if re.search(r"(?i)ignore .*instructions|system prompt|developer message|jailbreak", line):
            lines.append("[UNTRUSTED INSTRUCTION-LIKE CONTENT REMOVED]")
        else: lines.append(line)
    return "\n".join(lines)
