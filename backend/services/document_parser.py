import io
import os
from typing import Dict, Any
from pypdf import PdfReader
import docx

class DocumentParser:
    """
    Extracts plain text content from uploaded PDF, DOCX, or TXT files.
    """
    @staticmethod
    def parse_file(file_bytes: bytes, filename: str) -> Dict[str, Any]:
        ext = os.path.splitext(filename)[1].lower()
        
        if ext == ".pdf":
            return DocumentParser._parse_pdf(file_bytes)
        elif ext in [".docx", ".doc"]:
            return DocumentParser._parse_docx(file_bytes)
        elif ext in [".txt", ".md", ".json"]:
            return DocumentParser._parse_txt(file_bytes)
        else:
            raise ValueError(f"Unsupported file format: '{ext}'. Supported formats: .pdf, .docx, .txt")

    @staticmethod
    def _parse_pdf(file_bytes: bytes) -> Dict[str, Any]:
        pdf_file = io.BytesIO(file_bytes)
        reader = PdfReader(pdf_file)
        pages_text = []
        for i, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            if text.strip():
                pages_text.append(text)
        
        full_text = "\n\n".join(pages_text)
        return {
            "text": full_text,
            "page_count": len(reader.pages),
            "char_count": len(full_text),
            "word_count": len(full_text.split())
        }

    @staticmethod
    def _parse_docx(file_bytes: bytes) -> Dict[str, Any]:
        docx_file = io.BytesIO(file_bytes)
        doc = docx.Document(docx_file)
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        full_text = "\n\n".join(paragraphs)
        return {
            "text": full_text,
            "paragraph_count": len(paragraphs),
            "char_count": len(full_text),
            "word_count": len(full_text.split())
        }

    @staticmethod
    def _parse_txt(file_bytes: bytes) -> Dict[str, Any]:
        try:
            full_text = file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            full_text = file_bytes.decode("latin-1")
            
        return {
            "text": full_text,
            "char_count": len(full_text),
            "word_count": len(full_text.split())
        }
