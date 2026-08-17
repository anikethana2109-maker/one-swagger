from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.middlewares.error_handler import http_exception_handler, validation_exception_handler
from app.middlewares.logging_middleware import LoggingMiddleware
from app.routers import auth_router, product_router, order_router

app = FastAPI(
    title="One Swagger API Reference",
    description="Universal Reference REST API for One Swagger — 1-Tap API Explorer & Interactive Playground for FastAPI, Express, Spring Boot, and all backends.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_middleware(LoggingMiddleware)

# Include Routers (prefixes are declared inside the routers)
app.include_router(auth_router.router)
app.include_router(product_router.router)
app.include_router(order_router.router)

@app.get("/", tags=["health"])
def health_check():
    return {
        "status": "healthy",
        "service": "One Swagger API",
        "version": "1.0.0",
        "docs": "/docs",
        "openapi": "/openapi.json"
    }
