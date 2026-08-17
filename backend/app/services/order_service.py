import uuid
from datetime import datetime, timezone
from typing import List
from fastapi import HTTPException, status
from app.models.schemas import OrderCreate, OrderResponse, OrderStatus

ORDERS_DB: List[dict] = []

class OrderService:
    @staticmethod
    def create_order(order_data: OrderCreate) -> OrderResponse:
        # Business logic validation: Coupon check
        discount = 0.0
        if order_data.coupon_code:
            if order_data.coupon_code.upper() == "DEV2026":
                discount = 0.20 # 20% discount
            elif order_data.coupon_code.upper() != "SWAGGERFREE":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid or expired coupon code: '{order_data.coupon_code}'. Valid codes: DEV2026, SWAGGERFREE"
                )

        # Calculate total
        raw_total = sum(item.unit_price * item.quantity for item in order_data.items)
        final_total = round(raw_total * (1.0 - discount), 2)

        new_order_id = f"ord_{uuid.uuid4().hex[:8]}"
        order_record = {
            "order_id": new_order_id,
            "customer_email": order_data.customer_email,
            "items": [item.model_dump() for item in order_data.items],
            "total_amount": final_total,
            "status": OrderStatus.PROCESSING,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        ORDERS_DB.append(order_record)
        return OrderResponse(**order_record)

    @staticmethod
    def get_all_orders() -> List[OrderResponse]:
        return [OrderResponse(**o) for o in ORDERS_DB]
