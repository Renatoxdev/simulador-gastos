from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db

router = APIRouter(prefix="/gastos", tags=["Gastos"])


@router.post(
    "",
    response_model=schemas.GastoRead,
    status_code=status.HTTP_201_CREATED,
)
def criar_gasto(
    gasto: schemas.GastoCreate,
    db: Session = Depends(get_db),
):
    novo_gasto = models.Gasto(**gasto.model_dump())

    db.add(novo_gasto)
    db.commit()
    db.refresh(novo_gasto)

    return novo_gasto


@router.get("", response_model=list[schemas.GastoRead])
def listar_gastos(db: Session = Depends(get_db)):
    return (
        db.query(models.Gasto)
        .order_by(models.Gasto.data.desc(), models.Gasto.id.desc())
        .all()
    )


@router.delete("/{gasto_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_gasto(
    gasto_id: int,
    db: Session = Depends(get_db),
):
    gasto = db.get(models.Gasto, gasto_id)

    if gasto is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gasto nao encontrado",
        )

    db.delete(gasto)
    db.commit()
