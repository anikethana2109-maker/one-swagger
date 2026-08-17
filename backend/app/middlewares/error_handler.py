from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "status_code": exc.status_code,
            "detail": exc.detail,
            "path": request.url.path,
        }
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Formats Pydantic v2 validation errors into structured array
    specifically designed to be consumed by the Backend Swagger AI Debugger.
    """
    formatted_errors = []
    for err in exc.errors():
        formatted_errors.append({
            "loc": list(err.get("loc", [])),
            "msg": err.get("msg", ""),
            "type": err.get("type", "")
        })
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": True,
            "status_code": 422,
            "detail": formatted_errors,
            "path": request.url.path,
            "message": "Pydantic Schema Validation Failed. Use Backend Swagger AI Debugger to fix payload."
        }
    )
