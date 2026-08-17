from typing import List
from fastapi import APIRouter, status
from app.models.schemas import OrderCreate, OrderResponse
from app.services.order_service import OrderService

router = APIRouter(prefix="/api/v1/orders", tags=["Orders & Checkout"])

@router.post(
    "",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create & Place Order",
    description="Processes an order checkout. Designed with strict Pydantic validation rules to test the Backend Swagger AI Debugger when sending invalid items or coupon codes."
)
async def create_order(order_data: OrderCreate):
    return OrderService.create_order(order_data)

@router.get(
    "",
    response_model=List[OrderResponse],
    summary="List All Processed Orders",
    description="Returns a list of all placed orders in the system."
)
async def list_orders():
    return OrderService.get_all_orders()
