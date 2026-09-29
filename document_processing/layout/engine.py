import structlog

logger = structlog.get_logger()

TARGET_SECTIONS = [
    "title", "abstract", "introduction", "literature review", 
    "methodology", "results", "discussion", "conclusion", 
    "references", "limitations", "future work"
]

class LayoutEngine:
    def detect_sections(self, page_texts: list[str]) -> dict[int, str]:
        section_map = {}
        current_section = "unknown"
        
        for idx, text in enumerate(page_texts):
            if not text:
                section_map[idx] = current_section
                continue
            
            lines = text.split('\n')[:5]
            detected = False
            for line in lines:
                line_lower = line.lower().strip()
                for section in TARGET_SECTIONS:
                    if section in line_lower and len(line) < 60:
                        current_section = section
                        section_map[idx] = current_section
                        detected = True
                        break
                if detected:
                    break
            
            if not detected:
                section_map[idx] = current_section
                
        return section_map
