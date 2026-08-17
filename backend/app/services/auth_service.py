import uuid
from typing import Dict, Optional
from fastapi import HTTPException, status
from app.models.schemas import UserLogin, UserCreate, UserResponse, Token, UserRole
from app.core.security import create_access_token

# In-memory user store for developer testing
USERS_DB: Dict[str, dict] = {
    "developer@backendswagger.dev": {
        "id": "usr_dev_001",
        "email": "developer@backendswagger.dev",
        "full_name": "Dev Master",
        "password": "Secret123!",
        "role": UserRole.DEVELOPER,
        "is_active": True
    },
    "admin@backendswagger.dev": {
        "id": "usr_adm_999",
        "email": "admin@backendswagger.dev",
        "full_name": "Admin Superuser",
        "password": "AdminPass!2026",
        "role": UserRole.ADMIN,
        "is_active": True
    }
}

class AuthService:
    @staticmethod
    def authenticate_user(credentials: UserLogin) -> Token:
        user = USERS_DB.get(credentials.email)
        if not user or user["password"] != credentials.password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials. Verify your email and password.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        token_str = create_access_token(subject=user["id"])
        
        return Token(
            access_token=token_str,
            token_type="bearer",
            expires_in=3600,
            user=UserResponse(
                id=user["id"],
                email=user["email"],
                full_name=user["full_name"],
                role=user["role"],
                is_active=user["is_active"]
            )
        )

    @staticmethod
    def register_user(user_data: UserCreate) -> UserResponse:
        if user_data.email in USERS_DB:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"User with email '{user_data.email}' already exists."
            )
        
        user_id = f"usr_{uuid.uuid4().hex[:8]}"
        user_record = {
            "id": user_id,
            "email": user_data.email,
            "full_name": user_data.full_name,
            "password": user_data.password,
            "role": user_data.role,
            "is_active": True
        }
        USERS_DB[user_data.email] = user_record
        
        return UserResponse(
            id=user_id,
            email=user_data.email,
            full_name=user_data.full_name,
            role=user_data.role,
            is_active=True
        )

    @staticmethod
    def get_user_by_id(user_id: str) -> Optional[UserResponse]:
        for user in USERS_DB.values():
            if user["id"] == user_id:
                return UserResponse(
                    id=user["id"],
                    email=user["email"],
                    full_name=user["full_name"],
                    role=user["role"],
                    is_active=user["is_active"]
                )
        return None
