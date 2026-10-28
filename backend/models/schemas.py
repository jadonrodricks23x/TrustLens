from typing import List, Optional, Union, Any
from pydantic import BaseModel, Field, model_validator

class SignalItem(BaseModel):
    name: str = Field(..., description="Short name of the signal, e.g. Urgency")
    severity: str = Field(default="medium", description="Severity level: low, medium, or high")
    reason: str = Field(..., description="Explanation of why this signal was flagged (15-25 words)")

    @model_validator(mode="before")
    @classmethod
    def validate_signal(cls, data: Any) -> Any:
        if isinstance(data, str):
            return {"name": data, "severity": "medium", "reason": data}
        return data

class AnalysisResult(BaseModel):
    id: str
    type: str = Field(..., description="Analysis type: scam, news, url, or screenshot")
    score: int = Field(..., ge=0, le=100, description="TrustLens Score from 0 to 100")
    trust_score: Optional[int] = Field(default=None, description="Alias for score (0 to 100)")
    risk_level: str = Field(..., description="LOW CONCERN, NEEDS VERIFICATION, SUSPICIOUS, or HIGH RISK INDICATORS")
    verdict: str = Field(..., description="Short assessment phrase, e.g. Potentially suspicious")
    signals: List[SignalItem] = Field(default_factory=list, description="Up to 5 explainable signals")
    summary: str = Field(..., description="Concise assessment summary (~40 words or less)")
    explanation: Optional[str] = Field(default=None, description="Alias for summary")
    recommendation: str = Field(..., description="Actionable recommendation (~30 words or less)")
    created_at: str
    is_mock: bool = False
    local_signals_only: bool = False
    extracted_text: Optional[str] = None
    ocr_confidence: Optional[int] = None

    @model_validator(mode="before")
    @classmethod
    def sync_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Sync trust_score and score
            if "score" not in data and "trust_score" in data:
                data["score"] = data["trust_score"]
            elif "trust_score" not in data and "score" in data:
                data["trust_score"] = data["score"]

            # Sync explanation and summary
            if "summary" not in data and "explanation" in data:
                data["summary"] = data["explanation"]
            elif "explanation" not in data and "summary" in data:
                data["explanation"] = data["summary"]

            # Ensure verdict exists
            if "verdict" not in data or not data["verdict"]:
                data["verdict"] = data.get("risk_level", "Assessment complete")

        return data

class ScamRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000, description="Suspicious message or email content")

class NewsRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=8000, description="Headline, claim, or news article content")

class UrlRequest(BaseModel):
    url: str = Field(..., min_length=1, max_length=2048, description="Web address to inspect")
