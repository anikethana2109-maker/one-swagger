from typing import List, Optional
from enum import Enum
from pydantic import BaseModel, EmailStr, Field

class UserRole(str, Enum):
    ADMIN = "admin"
    DEVELOPER = "developer"
    VIEWER = "viewer"

# --- Authentication & User Schemas ---
class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="Registered user email", json_schema_extra={"example": "developer@backendswagger.dev"})
    password: str = Field(..., min_length=6, description="User password (min 6 characters)", json_schema_extra={"example": "Secret123!"})

class UserCreate(BaseModel):
    email: EmailStr = Field(..., description="Unique email address", json_schema_extra={"example": "alex@backendswagger.dev"})
    full_name: str = Field(..., min_length=2, max_length=100, description="Full name of user", json_schema_extra={"example": "Alex Mercer"})
    password: str = Field(..., min_length=6, description="Password", json_schema_extra={"example": "DevPassword!2026"})
    role: UserRole = Field(default=UserRole.DEVELOPER, description="Role in the organization")

class UserResponse(BaseModel):
    id: str = Field(..., json_schema_extra={"example": "usr_98a76b5c"})
    email: EmailStr = Field(..., json_schema_extra={"example": "alex@backendswagger.dev"})
    full_name: str = Field(..., json_schema_extra={"example": "Alex Mercer"})
    role: UserRole = Field(..., json_schema_extra={"example": UserRole.DEVELOPER})
    is_active: bool = Field(default=True, json_schema_extra={"example": True})

class Token(BaseModel):
    access_token: str = Field(..., json_schema_extra={"example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."})
    token_type: str = Field(default="bearer", json_schema_extra={"example": "bearer"})
    expires_in: int = Field(default=3600, json_schema_extra={"example": 3600})
    user: UserResponse

# --- Product Schemas ---
class ProductCategory(str, Enum):
    DEVELOPER_TOOLS = "developer_tools"
    API_GATEWAYS = "api_gateways"
    AI_SERVICES = "ai_services"
    SUBSCRIPTIONS = "subscriptions"

class ProductCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=120, json_schema_extra={"example": "Backend Swagger AI Pro License"})
    description: str = Field(..., json_schema_extra={"example": "Unlimited AI debugging tokens, zero-CORS runner, and schema synthesis"})
    category: ProductCategory = Field(..., json_schema_extra={"example": ProductCategory.DEVELOPER_TOOLS})
    price: float = Field(..., gt=0, description="Price in USD (must be strictly > 0)", json_schema_extra={"example": 49.99})
    in_stock: bool = Field(default=True, json_schema_extra={"example": True})
    tags: List[str] = Field(default=[], json_schema_extra={"example": ["ai", "devtools", "swagger", "fastapi"]})

class ProductResponse(ProductCreate):
    id: str = Field(..., json_schema_extra={"example": "prod_44f12d"})
    created_at: str = Field(..., json_schema_extra={"example": "2026-08-16T12:00:00Z"})

# --- Order Schemas (Designed for testing 422 Unprocessable Entity & AI Debugger) ---
class OrderItem(BaseModel):
    product_id: str = Field(..., min_length=4, json_schema_extra={"example": "prod_44f12d"})
    quantity: int = Field(..., ge=1, le=100, description="Quantity between 1 and 100", json_schema_extra={"example": 2})
    unit_price: float = Field(..., gt=0, json_schema_extra={"example": 49.99})

class OrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class OrderCreate(BaseModel):
    items: List[OrderItem] = Field(..., min_items=1, description="Order must contain at least 1 item")
    customer_email: EmailStr = Field(..., json_schema_extra={"example": "billing@backendswagger.dev"})
    shipping_address: str = Field(..., min_length=10, json_schema_extra={"example": "100 Innovation Blvd, Suite 200, Austin, TX"})
    payment_method: str = Field(..., pattern="^(credit_card|paypal|stripe_token)$", description="Must be credit_card, paypal, or stripe_token", json_schema_extra={"example": "credit_card"})
    coupon_code: Optional[str] = Field(None, max_length=20, json_schema_extra={"example": "DEV2026"})

class OrderResponse(BaseModel):
    order_id: str = Field(..., json_schema_extra={"example": "ord_8923bc1"})
    customer_email: EmailStr = Field(..., json_schema_extra={"example": "billing@backendswagger.dev"})
    items: List[OrderItem]
    total_amount: float = Field(..., json_schema_extra={"example": 99.98})
    status: OrderStatus = Field(default=OrderStatus.PENDING)
    created_at: str = Field(..., json_schema_extra={"example": "2026-08-16T12:30:00Z"})

# --- Error Schemas ---
class ValidationErrorDetail(BaseModel):
    loc: List[str | int] = Field(..., json_schema_extra={"example": ["body", "items", 0, "quantity"]})
    msg: str = Field(..., json_schema_extra={"example": "Input should be greater than or equal to 1"})
    type: str = Field(..., json_schema_extra={"example": "greater_than_equal"})

class ErrorResponse(BaseModel):
    detail: str | List[ValidationErrorDetail] = Field(..., json_schema_extra={"example": "Resource not found or validation failed"})
