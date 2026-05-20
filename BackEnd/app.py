from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from routers import gastos, rendas

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Simulador de Gastos API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(gastos.router)
app.include_router(rendas.router)


@app.get("/")
def health_check():
    return {"status": "ok"}
