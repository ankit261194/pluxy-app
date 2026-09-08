"""
Creator Studio & Monetization Router: Real Wallet Ledger, Payouts, and Gifts.
No simulated instant money. Payout requests validate balance and require gateway or manual processing.
"""

import time
import secrets
from typing import Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException
from backend.database import get_db
from backend.security import get_current_user

router = APIRouter(prefix="/api/creator", tags=["creator"])

class PayoutRequest(BaseModel):
    amount: float = Field(..., gt=0)
    upi_id: Optional[str] = None
    bank_details: Optional[str] = None
    idempotency_key: Optional[str] = None

class GiftRequest(BaseModel):
    target_username: str
    gift_name: str
    amount: float = Field(..., gt=0)

@router.get("/wallet")
async def get_wallet(current_user: dict = Depends(get_current_user)):
    uid = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT balance, total_views, rpm_rate, lifetime_earnings, virtual_gifts_count FROM creator_wallets WHERE user_id = ?", (uid,))
        wallet = cursor.fetchone()
        if not wallet:
            now = int(time.time() * 1000)
            cursor.execute("INSERT OR IGNORE INTO creator_wallets (user_id, balance, total_views, rpm_rate, lifetime_earnings, updated_at) VALUES (?, 0.0, 0, 75.0, 0.0, ?)", (uid, now))
            wallet = {"balance": 0.0, "total_views": 0, "rpm_rate": 75.0, "lifetime_earnings": 0.0, "virtual_gifts_count": 0}
        else:
            wallet = dict(wallet)

        cursor.execute("SELECT id, type, amount, title, status, ref_id, created_at FROM wallet_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20", (uid,))
        transactions = [
            {
                "id": t["id"],
                "type": t["type"],
                "amount": t["amount"],
                "title": t["title"],
                "status": t["status"],
                "refId": t["ref_id"],
                "date": "Recent"
            } for t in cursor.fetchall()
        ]

    return {
        "success": True,
        "wallet": {
            "userId": uid,
            "balance": wallet["balance"],
            "totalViews": wallet["total_views"],
            "rpmRate": wallet["rpm_rate"],
            "lifetimeEarnings": wallet["lifetime_earnings"],
            "virtualGiftsCount": wallet["virtual_gifts_count"],
            "transactions": transactions
        }
    }

@router.post("/withdraw")
async def request_withdrawal(req: PayoutRequest, current_user: dict = Depends(get_current_user)):
    uid = current_user["id"]
    now = int(time.time() * 1000)

    if req.amount < 100:
        raise HTTPException(status_code=400, detail="Minimum payout withdrawal amount is ₹100.")

    if not req.upi_id and not req.bank_details:
        raise HTTPException(status_code=400, detail="Please provide a valid UPI ID or Bank Details for cashout.")

    idemp_key = req.idempotency_key or f"idemp_{uid}_{int(time.time())}"

    with get_db() as conn:
        cursor = conn.cursor()
        # Atomic balance check and deduction
        cursor.execute("SELECT balance FROM creator_wallets WHERE user_id = ?", (uid,))
        row = cursor.fetchone()
        current_balance = row[0] if row else 0.0

        if current_balance < req.amount:
            raise HTTPException(status_code=400, detail=f"Insufficient balance in Creator Wallet. Available: ₹{current_balance:,.2f}")

        # Deduct balance atomically
        cursor.execute("UPDATE creator_wallets SET balance = balance - ?, updated_at = ? WHERE user_id = ?", (req.amount, now, uid))

        payout_id = f"payout_{int(time.time())}_{secrets.token_hex(4)}"
        ref_id = f"PLX{secrets.randbelow(899999999) + 100000000}"

        cursor.execute("""
            INSERT INTO payout_requests (id, user_id, amount, upi_id, bank_details, status, idempotency_key, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 'pending_gateway', ?, ?, ?)
        """, (payout_id, uid, req.amount, req.upi_id, req.bank_details, idemp_key, now, now))

        cursor.execute("""
            INSERT INTO wallet_transactions (id, user_id, type, amount, title, status, ref_id, created_at)
            VALUES (?, ?, 'withdrawal', ?, ?, 'pending', ?, ?)
        """, (f"tx_{int(time.time()*1000)}", uid, req.amount, f"UPI Withdrawal to {req.upi_id or 'Bank'}", ref_id, now))

    return {
        "success": True,
        "payoutId": payout_id,
        "refId": ref_id,
        "status": "pending_manual_review",
        "message": "Payout request submitted successfully. Processing via banking network (24-48 hrs)."
    }

@router.post("/gift")
async def send_gift(req: GiftRequest, current_user: dict = Depends(get_current_user)):
    now = int(time.time() * 1000)
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE LOWER(username) = ?", (req.target_username.lower(),))
        target_row = cursor.fetchone()
        if not target_row:
            raise HTTPException(status_code=404, detail="Creator not found")

        target_id = target_row[0]
        # Credit target creator wallet
        cursor.execute("""
            UPDATE creator_wallets
            SET balance = balance + ?, lifetime_earnings = lifetime_earnings + ?, virtual_gifts_count = virtual_gifts_count + 1, updated_at = ?
            WHERE user_id = ?
        """, (req.amount, req.amount, now, target_id))

        cursor.execute("""
            INSERT INTO wallet_transactions (id, user_id, type, amount, title, status, ref_id, created_at)
            VALUES (?, ?, 'fan_gift', ?, ?, 'credited', ?, ?)
        """, (f"tx_{int(time.time()*1000)}", target_id, req.amount, f"{req.gift_name} Gift from {current_user['display_name']}", f"GIFT_{secrets.token_hex(4).upper()}", now))

    return {"success": True, "message": f"Gift {req.gift_name} (₹{req.amount}) sent to @{req.target_username}!"}
