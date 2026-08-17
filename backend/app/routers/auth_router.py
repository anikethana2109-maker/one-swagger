from fastapi import APIRouter, status
from app.models.schemas import UserLogin, UserCreate, UserResponse, Token
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

@router.post(
    "/login",
    response_model=Token,
    summary="Authenticate User & Obtain JWT",
    description="Validates user email and password, returning a Bearer access token for protected API endpoints."
)
async def login(credentials: UserLogin):
    return AuthService.authenticate_user(credentials)

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register New User Account",
    description="Creates a new developer account and registers them in the system."
)
async def register(user_data: UserCreate):
    return AuthService.register_user(user_data)
