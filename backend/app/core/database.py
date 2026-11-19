from sqlalchemy.orm import sessionmaker
from sqlmodel import Session, SQLModel, create_engine

from app.core.config import DATABASE_URL

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)

session_factory = sessionmaker(bind=engine, class_=Session, expire_on_commit=False)


def create_all_tables() -> None:
    SQLModel.metadata.create_all(engine)