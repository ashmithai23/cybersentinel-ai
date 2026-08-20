from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.database.session import get_db
from backend.app.database.models import User
from backend.app.schemas.schemas import UserLogin, UserRegister, TokenResponse, UserOut
from backend.app.core.security import verify_password, get_password_hash, create_access_token, get_current_user_payload, TokenPayload
from backend.app.services.audit_service import log_audit_event

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
async def login(login_data: UserLogin, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(User).where(User.email == login_data.email))
    user = res.scalar_one_or_none()
    
    if not user or not verify_password(login_data.password, user.hashed_password):
        await log_audit_event(db, login_data.email, "USER_LOGIN", "AUTH", result="FAILURE")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is deactivated."
        )

    access_token = create_access_token(subject=user.id, email=user.email, role=user.role)
    await log_audit_event(db, user.email, "USER_LOGIN", "AUTH", result="SUCCESS")
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user={
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    )

@router.post("/token", response_model=TokenResponse)
async def login_form(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    """OAuth2 compatible token login endpoint for Swagger UI testing."""
    return await login(UserLogin(email=form_data.username, password=form_data.password), db)

@router.post("/register", response_model=UserOut)
async def register(reg_data: UserRegister, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(User).where(User.email == reg_data.email))
    existing = res.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )
        
    user = User(
        email=reg_data.email,
        hashed_password=get_password_hash(reg_data.password),
        full_name=reg_data.full_name,
        role=reg_data.role or "Security Analyst"
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    await log_audit_event(db, user.email, "USER_REGISTER", "AUTH", result="SUCCESS")
    return user

@router.get("/me", response_model=UserOut)
async def get_me(payload: TokenPayload = Depends(get_current_user_payload), db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(User).where(User.email == payload.email))
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User profile not found.")
    return user
