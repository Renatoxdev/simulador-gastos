from datetime import date

from pydantic import BaseModel, Field


class LancamentoBase(BaseModel):
    nome: str = Field(min_length=1, max_length=120)
    valor: float = Field(gt=0)
    data: date
    descricao: str | None = Field(default=None, max_length=255)


class GastoCreate(LancamentoBase):
    pass


class GastoRead(LancamentoBase):
    id: int

    class Config:
        from_attributes = True


class RendaCreate(LancamentoBase):
    pass


class RendaRead(LancamentoBase):
    id: int

    class Config:
        from_attributes = True
