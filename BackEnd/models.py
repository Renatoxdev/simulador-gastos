from sqlalchemy import Column, Date, Float, Integer, String

from database import Base


class Gasto(Base):
    __tablename__ = "gastos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(120), nullable=False)
    descricao = Column(String(255), nullable=True)
    valor = Column(Float, nullable=False)
    data = Column(Date, nullable=False)


class Renda(Base):
    __tablename__ = "rendas"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(120), nullable=False)
    descricao = Column(String(255), nullable=True)
    valor = Column(Float, nullable=False)
    data = Column(Date, nullable=False)
