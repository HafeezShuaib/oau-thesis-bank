import pymupdf
import structlog

logger = structlog.get_logger()

class DigitalParser:
    def extract(self, pdf_path: str) -> tuple[list[str], list[int]]:
        doc = pymupdf.open(pdf_path)
        page_texts = []
        failed_pages = []
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text").strip()
            
            if len(text) < 50 and self._has_images(page):
                failed_pages.append(page_num)
                page_texts.append("")
            else:
                page_texts.append(text)
                
        doc.close()
        logger.info("digital_extraction_complete", total_pages=len(page_texts), failed_pages=len(failed_pages))
        return page_texts, failed_pages

    def _has_images(self, page) -> bool:
        return len(page.get_images(full=True)) > 0
