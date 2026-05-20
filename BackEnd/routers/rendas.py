from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db

router = APIRouter(prefix="/rendas", tags=["Rendas"])


@router.post(
    "",
    response_model=schemas.RendaRead,
    status_code=status.HTTP_201_CREATED,
)
def criar_renda(
    renda: schemas.RendaCreate,
    db: Session = Depends(get_db),
):
    nova_renda = models.Renda(**renda.model_dump())

    db.add(nova_renda)
    db.commit()
    db.refresh(nova_renda)

    return nova_renda


@router.get("", response_model=list[schemas.RendaRead])
def listar_rendas(db: Session = Depends(get_db)):
    return (
        db.query(models.Renda)
        .order_by(models.Renda.data.desc(), models.Renda.id.desc())
        .all()
    )


@router.delete("/{renda_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_renda(
    renda_id: int,
    db: Session = Depends(get_db),
):
    renda = db.get(models.Renda, renda_id)

    if renda is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Renda nao encontrada",
        )

    db.delete(renda)
    db.commit()
