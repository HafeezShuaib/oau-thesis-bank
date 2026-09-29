class PaddleOCRFallback:
    """Optional selective OCR adapter. OCR is invoked only for pages flagged by digital extraction."""
    def __init__(self, lang="en"):
        try:
            from paddleocr import PaddleOCR
        except ImportError as e:
            raise RuntimeError("Install the [ocr] extra to enable PaddleOCR") from e
        self.engine=PaddleOCR(lang=lang, use_doc_orientation_classify=False, use_doc_unwarping=False, use_textline_orientation=False)
    def image_to_text(self, image_path: str) -> str:
        result=self.engine.predict(image_path)
        parts=[]
        for item in result:
            if isinstance(item, dict):
                txt=item.get("rec_texts", [])
                parts.extend(txt if isinstance(txt,list) else [str(txt)])
        return " ".join(parts)
