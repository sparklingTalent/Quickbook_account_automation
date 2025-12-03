"""Main FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.api.batch import router as batch_router
from config import settings

app = FastAPI(
    title="QuickBooks Accounting Automation",
    description="Automated salary variance reporting for Architecture and Engineering firms",
    version="1.0.0"
)

# CORS middleware - allow Vercel frontend and localhost
import os
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "https://quickbook-account-automation.vercel.app",
]

# Add custom origins from environment variable
if os.getenv("ALLOWED_ORIGINS"):
    if os.getenv("ALLOWED_ORIGINS") == "*":
        allowed_origins = ["*"]  # Allow all origins
    else:
        custom_origins = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS").split(",")]
        allowed_origins.extend(custom_origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(router)
app.include_router(batch_router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "QuickBooks Accounting Automation API",
        "version": "1.0.0",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level=settings.log_level.lower()
    )

