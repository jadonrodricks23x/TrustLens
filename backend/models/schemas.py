from typing import List, Optional
from pydantic import BaseModel, Field

class SignalItem(BaseModel):
    name: str = Field(..., description="Short name of the signal, e.g. Urgency")
    severity: str = Field(..., description="Severity level: low, medium, or high")
    reason: str = Field(..., description="Explanation of why this signal was flagged (15-25 words)")

class AnalysisResult(BaseModel):
    id: str
    type: str = Field(..., description="Analysis type: scam, news, url, or screenshot")
    score: int = Field(..., ge=0, le=100, description="TrustLens Score from 0 to 100")
    risk_level: str = Field(..., description="LOW CONCERN, NEEDS VERIFICATION, SUSPICIOUS, or HIGH RISK INDICATORS")
    verdict: str = Field(..., description="Short assessment phrase, e.g. Potentially suspicious")
    signals: List[SignalItem] = Field(default_factory=list, description="Up to 5 explainable signals")
    summary: str = Field(..., description="Concise assessment summary (~40 words or less)")
    recommendation: str = Field(..., description="Actionable recommendation (~30 words or less)")
    created_at: str
    is_mock: bool = False
    local_signals_only: bool = False

class ScamRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000, description="Suspicious message or email content")

class NewsRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=8000, description="Headline, claim, or news article content")

class UrlRequest(BaseModel):
    url: str = Field(..., min_length=1, max_length=2048, description="Web address to inspect")
