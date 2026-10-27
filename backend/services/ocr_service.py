import io
import re
from typing import Tuple, Optional
from PIL import Image

# Check pytesseract availability safely
PYTESSERACT_AVAILABLE = False
try:
    import pytesseract
    # Test if tesseract binary is actually found
    pytesseract.get_tesseract_version()
    PYTESSERACT_AVAILABLE = True
except Exception:
    PYTESSERACT_AVAILABLE = False

ALLOWED_MIME_TYPES = {
    "image/png", "image/jpeg", "image/jpg", "image/webp"
}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def validate_image_upload(content_type: str, file_size: int) -> Optional[str]:
    """Validates MIME type and file size."""
    if content_type.lower() not in ALLOWED_MIME_TYPES:
        return f"Unsupported file type '{content_type}'. Please upload PNG, JPG, JPEG, or WEBP."
    if file_size > MAX_FILE_SIZE:
        return f"File size ({file_size / (1024*1024):.1f}MB) exceeds the 5MB maximum limit."
    return None

def extract_text_from_image_bytes(image_bytes: bytes) -> Tuple[str, bool]:
    """
    Extracts text from uploaded image bytes without saving to disk.
    Returns (extracted_text, used_ocr_flag).
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        image.verify()  # Verify image integrity
        
        # Re-open for reading after verify()
        image = Image.open(io.BytesIO(image_bytes))
    except Exception as e:
        return "", False

    extracted_text = ""
    used_ocr = False

    if PYTESSERACT_AVAILABLE:
        try:
            extracted_text = pytesseract.image_to_string(image).strip()
            if extracted_text:
                used_ocr = True
        except Exception:
            extracted_text = ""

    # If tesseract wasn't available or returned empty, try extracting embedded IPTC/EXIF/text metadata
    if not extracted_text:
        try:
            info = image.info
            meta_strings = []
            for k, v in info.items():
                if isinstance(v, str) and len(v) > 5:
                    meta_strings.append(v)
            if meta_strings:
                extracted_text = " ".join(meta_strings).strip()
        except Exception:
            pass

    return extracted_text, used_ocr
