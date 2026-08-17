from typing import List, Optional
from fastapi import APIRouter, status, Query
from app.models.schemas import ProductCreate, ProductResponse, ProductCategory
from app.services.product_service import ProductService

router = APIRouter(prefix="/api/v1/products", tags=["Products & Catalog"])

@router.get(
    "",
    response_model=List[ProductResponse],
    summary="List All Products",
    description="Retrieves product catalog items with optional category filtering and search querying."
)
async def list_products(
    category: Optional[ProductCategory] = Query(None, description="Filter products by category"),
    search: Optional[str] = Query(None, description="Search term for product name/description")
):
    return ProductService.get_all_products(category=category, search=search)

@router.get(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Get Product by ID",
    description="Fetches specific product details using its unique identifier."
)
async def get_product(product_id: str):
    return ProductService.get_product_by_id(product_id)

@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create New Product",
    description="Adds a new product item into the catalog with price and stock validation."
)
async def create_product(product: ProductCreate):
    return ProductService.create_product(product)
