import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from routes.scam import router as scam_router
from routes.news import router as news_router
from routes.url import router as url_router
from routes.screenshot import router as screenshot_router

app = FastAPI(
    title="TrustLens AI API",
    description="Explainable AI-powered digital safety platform backend.",
    version="1.0.0"
)

# CORS configuration
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    os.getenv("FRONTEND_URL", "http://localhost:5173")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Centralized error handlers
@app.exception_handler(StarletteHTTPException)
async def custom_http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail or "An error occurred processing the request."}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    first_msg = errors[0].get("msg", "Invalid input data") if errors else "Invalid input"
    loc = " -> ".join([str(x) for x in errors[0].get("loc", [])]) if errors else ""
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": f"{first_msg} ({loc})" if loc else first_msg}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    # Log error message safely without logging raw user content
    print(f"[Internal Server Error] {type(exc).__name__}: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "TrustLens server encountered an error processing your analysis."}
    )

# Health endpoint
@app.get("/api/health", tags=["Health"])
async def health_check():
    has_openai = bool(os.getenv("OPENAI_API_KEY", "").strip())
    has_supabase = bool(os.getenv("SUPABASE_URL", "").strip())
    return {
        "status": "healthy",
        "service": "TrustLens AI",
        "version": "1.0.0",
        "ai_mode": "live_openai" if has_openai else "local_mock_mode",
        "storage": "supabase" if has_supabase else "local_storage_fallback"
    }

# Register routers
app.include_router(scam_router)
app.include_router(news_router)
app.include_router(url_router)
app.include_router(screenshot_router)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
