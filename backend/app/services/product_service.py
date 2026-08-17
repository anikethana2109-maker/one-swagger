import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from app.models.schemas import ProductCreate, ProductResponse, ProductCategory

PRODUCTS_DB = [
    {
        "id": "prod_swagger_pro",
        "name": "Backend Swagger AI Pro License",
        "description": "Unlimited AI debugging tokens, zero-CORS runner, and schema synthesis.",
        "category": ProductCategory.DEVELOPER_TOOLS,
        "price": 49.99,
        "in_stock": True,
        "tags": ["ai", "devtools", "swagger", "fastapi"],
        "created_at": "2026-08-16T10:00:00Z"
    },
    {
        "id": "prod_cors_proxy",
        "name": "Zero-CORS Gateway Worker",
        "description": "Dedicated low-latency proxy worker for cross-origin localhost testing.",
        "category": ProductCategory.API_GATEWAYS,
        "price": 19.99,
        "in_stock": True,
        "tags": ["proxy", "networking", "cors"],
        "created_at": "2026-08-16T11:00:00Z"
    },
    {
        "id": "prod_gemini_tokens",
        "name": "Gemini 2.0 Flash AI Credits Pack",
        "description": "1,000,000 High-Speed Diagnostic Tokens for root-cause API error analysis.",
        "category": ProductCategory.AI_SERVICES,
        "price": 9.99,
        "in_stock": True,
        "tags": ["gemini", "ai", "credits"],
        "created_at": "2026-08-16T12:00:00Z"
    }
]

class ProductService:
    @staticmethod
    def get_all_products(category: Optional[ProductCategory] = None, search: Optional[str] = None) -> List[ProductResponse]:
        results = PRODUCTS_DB
        if category:
            results = [p for p in results if p["category"] == category]
        if search:
            query = search.lower()
            results = [p for p in results if query in p["name"].lower() or query in p["description"].lower()]
        return [ProductResponse(**p) for p in results]

    @staticmethod
    def get_product_by_id(product_id: str) -> ProductResponse:
        for p in PRODUCTS_DB:
            if p["id"] == product_id:
                return ProductResponse(**p)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found."
        )

    @staticmethod
    def create_product(product_data: ProductCreate) -> ProductResponse:
        new_id = f"prod_{uuid.uuid4().hex[:8]}"
        record = product_data.model_dump()
        record["id"] = new_id
        record["created_at"] = datetime.now(timezone.utc).isoformat()
        PRODUCTS_DB.append(record)
        return ProductResponse(**record)
