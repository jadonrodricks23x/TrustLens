import os
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/settings", tags=["Settings"])

ENV_FILE_PATH = Path(__file__).resolve().parent.parent / ".env"

class ApiKeyPayload(BaseModel):
    api_key: str = Field(..., min_length=15, description="Google Gemini API key")
    model: Optional[str] = Field(default="gemini-2.5-flash", description="Gemini model name")

def _update_env_file(key: str, value: str):
    """Safely updates or adds a key in the backend/.env file."""
    lines = []
    if ENV_FILE_PATH.exists():
        with open(ENV_FILE_PATH, "r", encoding="utf-8") as f:
            lines = f.readlines()

    key_found = False
    new_lines = []
    for line in lines:
        if line.strip().startswith(f"{key}=") or line.strip() == key:
            new_lines.append(f"{key}={value}\n")
            key_found = True
        else:
            new_lines.append(line)

    if not key_found:
        if new_lines and not new_lines[-1].endswith("\n"):
            new_lines.append("\n")
        new_lines.append(f"{key}={value}\n")

    with open(ENV_FILE_PATH, "w", encoding="utf-8") as f:
        f.writelines(new_lines)

@router.get("/api-key")
async def get_api_key_status():
    raw_key = os.getenv("GEMINI_API_KEY", "").strip()
    has_key = bool(raw_key)
    masked = ""
    if has_key:
        masked = raw_key[:6] + "..." + raw_key[-4:] if len(raw_key) > 10 else "configured"

    return {
        "has_key": has_key,
        "masked_key": masked,
        "model": os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    }

@router.post("/api-key")
async def set_api_key(payload: ApiKeyPayload):
    key = payload.api_key.strip()
    model = (payload.model or "gemini-2.5-flash").strip()

    if not key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Gemini API key cannot be empty."
        )

    # Validate key by making a test call with google-genai SDK
    try:
        from google import genai
        client = genai.Client(api_key=key)
        # Verify model access
        client.models.get(model=model)
    except Exception as e:
        err_msg = str(e)
        # Sanitize any accidental key leak in error message
        err_msg = err_msg.replace(key, "******")
        if "403" in err_msg or "API_KEY_INVALID" in err_msg or "unregistered" in err_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Gemini API key. Please verify your key in Google AI Studio."
            )
        # If it is just a network timeout or permissions check, let it save with warning
        print(f"[API Key Warning] Model check: {type(e).__name__}: {err_msg[:120]}")

    # Set in running process environment
    os.environ["GEMINI_API_KEY"] = key
    os.environ["GEMINI_MODEL"] = model

    # Persist in backend/.env
    try:
        _update_env_file("GEMINI_API_KEY", key)
        _update_env_file("GEMINI_MODEL", model)
    except Exception as write_err:
        print(f"[Warning] Failed to write .env file: {write_err}")

    masked = key[:6] + "..." + key[-4:] if len(key) > 10 else "configured"
    return {
        "success": True,
        "message": "Gemini API key successfully configured and activated.",
        "masked_key": masked,
        "model": model
    }

@router.delete("/api-key")
async def remove_api_key():
    os.environ["GEMINI_API_KEY"] = ""
    try:
        _update_env_file("GEMINI_API_KEY", "")
    except Exception as e:
        print(f"[Warning] Failed to update .env: {e}")

    return {
        "success": True,
        "message": "Gemini API key removed. Reverted to local development mock mode."
    }
