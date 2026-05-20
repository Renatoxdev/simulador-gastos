# Simulador de Gastos

Aplicacao full stack para controle simples de gastos, rendas e saldo financeiro.

O projeto usa **FastAPI** no BackEnd, com persistencia em **SQLite**, e **Next.js com TypeScript** no FrontEnd. A interface permite cadastrar, listar e remover gastos e rendas, exibindo totais, saldo atual e graficos de visao mensal.

## Tecnologias

### BackEnd

- Python
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- Uvicorn

### FrontEnd

- Next.js 14+ / App Router
- React
- TypeScript
- CSS global
- Fetch API
- PWA basico com manifest e service worker

## Estrutura do projeto

```txt
.
|-- BackEnd/
|   |-- app.py
|   |-- database.py
|   |-- models.py
|   |-- schemas.py
|   |-- requirements.txt
|   `-- routers/
|       |-- gastos.py
|       `-- rendas.py
|
|-- FrontEnd/
|   |-- src/
|   |   |-- app/
|   |   |   |-- page.tsx
|   |   |   |-- layout.tsx
|   |   |   |-- globals.css
|   |   |   `-- components/
|   |   `-- services/
|   |       `-- api.ts
|   |-- public/
|   `-- package.json
|
`-- README.md
```

## Funcionalidades

- Cadastro de gastos
- Listagem de gastos
- Remocao de gastos
- Cadastro de rendas
- Listagem de rendas
- Remocao de rendas
- Persistencia local em SQLite
- Calculo de total de rendas
- Calculo de total de gastos
- Calculo de saldo
- Grafico de balanco
- Grafico mensal
- Exportacao dos dados exibidos em JSON
- Alternancia entre tema claro e escuro

## Banco de dados

O BackEnd usa SQLite com SQLAlchemy.

O arquivo do banco e criado automaticamente em:

```txt
BackEnd/gastos.db
```

As tabelas principais sao:

- `gastos`
- `rendas`

## Rotas da API

Por padrao, a API roda em:

```txt
http://127.0.0.1:8000
```

### Health check

```http
GET /
```

Resposta:

```json
{
  "status": "ok"
}
```

### Gastos

```http
GET /gastos
```

Lista todos os gastos cadastrados.

```http
POST /gastos
```

Cria um novo gasto.

Exemplo de body:

```json
{
  "nome": "Mercado",
  "valor": 150.75,
  "data": "2026-05-20",
  "descricao": "Compras da semana"
}
```

```http
DELETE /gastos/{id}
```

Remove um gasto pelo ID.

### Rendas

```http
GET /rendas
```

Lista todas as rendas cadastradas.

```http
POST /rendas
```

Cria uma nova renda.

Exemplo de body:

```json
{
  "nome": "Salario",
  "valor": 3500,
  "data": "2026-05-20",
  "descricao": "Pagamento mensal"
}
```

```http
DELETE /rendas/{id}
```

Remove uma renda pelo ID.

## Como rodar localmente

### 1. Clonar o repositorio

```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio
```

### 2. Rodar o BackEnd

Entre na pasta do BackEnd:

```bash
cd BackEnd
```

Crie e ative um ambiente virtual:

```bash
python -m venv .venv
```

No Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

No Linux/macOS:

```bash
source .venv/bin/activate
```

Instale as dependencias:

```bash
pip install -r requirements.txt
```

Inicie a API:

```bash
python -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```

Acesse a documentacao interativa:

```txt
http://127.0.0.1:8000/docs
```

### 3. Rodar o FrontEnd

Em outro terminal, entre na pasta do FrontEnd:

```bash
cd FrontEnd
```

Instale as dependencias:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

No Windows, se houver conflito com script PowerShell do npm, use:

```powershell
npm.cmd run dev
```

Acesse:

```txt
http://127.0.0.1:3000
```

## Variaveis de ambiente

O FrontEnd usa a API em `http://localhost:8000` por padrao.

Se quiser alterar a URL da API, crie um arquivo `.env.local` dentro de `FrontEnd/`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

## CORS

O FastAPI esta configurado para permitir chamadas vindas de:

```txt
http://localhost:3000
http://127.0.0.1:3000
```

Isso permite que o FrontEnd em desenvolvimento se comunique com a API local.

## Scripts uteis

### FrontEnd

Dentro da pasta `FrontEnd/`:

```bash
npm run dev
npm run build
npm run lint
npm run start
```

### BackEnd

Dentro da pasta `BackEnd/`:

```bash
python -m uvicorn app:app --reload
```

## Build do FrontEnd

Para gerar uma build de producao:

```bash
cd FrontEnd
npm run build
```

Para iniciar a build:

```bash
npm run start
```

## Observacoes

- O banco `gastos.db` e local e criado automaticamente.
- Para reiniciar os dados, basta parar a API e remover o arquivo `BackEnd/gastos.db`.
- O projeto foi pensado para estudo, portfolio e evolucao para recursos como autenticacao, filtros, categorias e relatorios.

## Possiveis melhorias futuras

- Edicao de gastos e rendas
- Filtros por periodo
- Categorias
- Relatorios por mes
- Autenticacao de usuarios
- Deploy do FrontEnd
- Deploy do BackEnd
- Testes automatizados

## Licenca

Este projeto esta disponivel para fins de estudo e portfolio. Ajuste a licenca conforme a necessidade do seu repositorio.
