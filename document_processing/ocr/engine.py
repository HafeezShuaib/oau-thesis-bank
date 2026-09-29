from paddleocr import PaddleOCR
import pymupdf
import structlog

logger = structlog.get_logger()

class OCREngine:
    def __init__(self):
        # Initialize once. Lang='en' for OAU theses.
        # Updated for PaddleOCR 3.x API
        self.ocr = PaddleOCR(use_textline_orientation=True, lang='en')

    def process_pages(self, pdf_path: str, page_indices: list[int]) -> dict[int, str]:
        """Returns dict mapping page_index -> extracted text"""
        results = {}
        if not page_indices:
            return results

        logger.info("starting_paddleocr_fallback", pages=len(page_indices))
        doc = pymupdf.open(pdf_path)
        
        for idx in page_indices:
            page = doc[idx]
            # Render page to image at 300 DPI for good OCR quality
            pix = page.get_pixmap(matrix=pymupdf.Matrix(300/72, 300/72))
            img_bytes = pix.tobytes("png")
            
            ocr_result = self.ocr.ocr(img_bytes)
            if ocr_result and ocr_result[0]:
                text = "\n".join([line[1][0] for line in ocr_result[0]])
                results[idx] = text
            else:
                results[idx] = ""
                
        doc.close()
        return results