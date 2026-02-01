# Simulador de Gastos (Next.js + PWA + localStorage)

Aplicação **100% front-end**, feita em **Next.js (App Router)**, que funciona como um app instalável (**PWA**), salva os dados no **localStorage** do navegador e continua operando **offline** (com Service Worker).

A interface é organizada em **duas colunas**:
- **Entradas** (salário, investimentos etc.)
- **Saídas** (contas, compras etc.)
E, abaixo, exibe o **Saldo** centralizado.

---

## ✅ Funcionalidades

### Lançamentos (Entradas e Saídas)
- Criar lançamentos com:
  - **Título**
  - **Descrição** (opcional)
  - **Data**
  - **Valor**
  - Tipo (**Entrada** ou **Saída**)
- Listar lançamentos já registrados (separados por coluna)
- Remover lançamentos individuais
- **Limpar tudo** (apaga todos os lançamentos com confirmação)

### Persistência
- Dados persistidos via `localStorage` (por **navegador/perfil/origem**)

### Backup (JSON)
- **Exportar JSON**: baixa um arquivo `.json` com todos os lançamentos
- **Importar JSON**: restaura lançamentos a partir de um arquivo `.json` (validação básica)
  - Por padrão, a importação faz **merge** (mescla por `id`, evitando duplicados)
  - Opcionalmente, pode ser trocado para **substituir tudo** (replace)

### PWA (Instalável + Offline)
- `manifest.json` configurado com:
  - `name`, `short_name`, `start_url`, `display`, `theme_color`, `background_color`
- Ícones nas resoluções **192x192** e **512x512**
- Registro de `service-worker.js`
- Funciona **offline**, mantendo os lançamentos salvos (via `localStorage`)
- Captura do evento `beforeinstallprompt` para exibir botão **Instalar app** (quando suportado)

---

## 🧱 Tecnologias

- Next.js (App Router)
- React
- TypeScript
- CSS (globals)
- Service Worker (cache/offline)
- localStorage (persistência)

---

## 📦 Requisitos

- Node.js **18+** (recomendado)
- npm (ou pnpm/yarn se preferir)

---

## 🚀 Como rodar localmente

### 1) Instalar dependências
```bash
npm install
```

### 2) Rodar em desenvolvimento
```bash
npm run dev
```
Acesse: `http://localhost:3000`

> **Importante:** em modo `dev`, o Service Worker pode não se comportar exatamente como em produção (isso é normal).  
Para testar **offline** e **instalação PWA**, use o modo de produção abaixo.

---

## 🧪 Testar PWA / Offline corretamente (produção)

Este projeto pode usar export estático para funcionar como “HTML estático” (recomendado):

### 1) Gerar build
```bash
npm run build
```

Se o `next.config.mjs` estiver com `output: "export"`, o resultado será gerado na pasta `out/`.

### 2) Servir o build estático
```bash
npx serve out
```

Abra o endereço exibido (geralmente `http://localhost:3000`).

### 3) Testar offline
1. Abra o site 1 vez (para o Service Worker cachear os arquivos).
2. Desligue a internet.
3. Recarregue a página — o app deve continuar funcionando, mantendo os dados do `localStorage`.

---

## 🧾 Como usar (na prática)

### Adicionar lançamentos
- Na coluna **Entradas** (esquerda): registre salário, investimento etc.
- Na coluna **Saídas** (direita): registre contas, compras etc.
- Preencha **Título**, **Data**, **Valor** e clique em **Adicionar**.

### Remover um lançamento
- Em qualquer card, clique em **Remover**.

### Limpar tudo
- No topo, clique em **Limpar tudo**.
- Confirme para apagar todos os lançamentos.
- Dica: **exporte um backup** antes se quiser guardar.

---

## 📦 Backup (Exportar / Importar JSON)

### Exportar
- Clique em **Exportar JSON**.
- Um arquivo será baixado como: `gastos-backup-AAAA-MM-DD.json`.

### Importar
- Clique em **Importar JSON** e selecione um arquivo `.json`.
- O app valida e importa os lançamentos.

#### Formatos aceitos
A importação aceita:
1) **Formato padrão (recomendado)**:
```json
{
  "version": 1,
  "exportedAt": "2026-01-31T20:12:33.000Z",
  "entries": [ ... ]
}
```

2) **Formato simples (array direto)**:
```json
[ { ... }, { ... } ]
```

#### Merge vs Replace
- **Merge (padrão):** mescla com o que já existe e evita duplicados por `id`.
- **Replace (opcional):** substitui tudo pelo conteúdo importado (pode ser ativado no código).

---

## 📲 Instalação como App (PWA)

### Desktop (Chrome/Edge)
- Se o navegador suportar, você verá o botão **“Instalar app”** no topo.
- Alternativamente: ícone de instalação na barra de endereço (varia por navegador).

### Android (Chrome/Edge)
- O botão **“Instalar app”** deve aparecer quando `beforeinstallprompt` for disparado.
- Às vezes o navegador exige:
  - HTTPS (ou localhost)
  - usuário ter visitado mais de uma vez
  - manifesto e SW válidos

### iOS (Safari)
O iOS não usa `beforeinstallprompt`. Para instalar:
- Compartilhar → **Adicionar à Tela de Início**

---

## 💾 Onde os dados ficam salvos?

Os lançamentos são salvos no `localStorage` do navegador, na chave:

- `simulador_gastos_entries_v1`

Isso significa:
- Os dados ficam **no seu dispositivo/navegador**
- Não há sincronização entre dispositivos
- Se você limpar os dados do site (cache/storage), os lançamentos podem ser apagados
- Backup em JSON é recomendado para evitar perdas

---

## 🗂️ Estrutura de arquivos (principais)

```
app/
  layout.tsx               # inclui manifest e theme-color
  page.tsx                 # UI + lógica CRUD + localStorage + backup JSON
  globals.css              # estilos responsivos
  components/
    PwaClient.tsx          # registra SW + beforeinstallprompt
public/
  manifest.json            # manifesto PWA
  service-worker.js        # cache/offline
  icons/
    icon-192.png
    icon-512.png
next.config.mjs            # (opcional) export estático
```

---

## 🧠 Como o offline funciona?

O `service-worker.js`:
- faz **cache** dos recursos essenciais (core assets)
- usa estratégias:
  - **network-first** para navegação (HTML), com fallback para cache
  - **cache-first** para assets estáticos (`/_next/static/*`, imagens, css, js etc.)

> Observação: os lançamentos continuam disponíveis offline porque estão no `localStorage`, não no cache do SW.

---

## 🛠️ Dicas e Troubleshooting

### “Offline não funciona”
- Teste em **produção** (build + serve).
- Abra a página online **uma vez** antes de ficar offline.
- Verifique se o Service Worker está registrado:
  - DevTools → Application → Service Workers

### “Botão de instalar não aparece”
Depende do navegador e critérios de PWA:
- Precisa de HTTPS (ou localhost)
- Manifest válido e acessível
- Service Worker funcionando
- Às vezes, “engajamento” (mais de uma visita)

### “Vou publicar no GitHub Pages (subpasta) e quebrou o SW/manifest”
Se publicar em subpasta (ex.: `/meu-repo/`), é necessário ajustar:
- `start_url` (e possivelmente `scope`) no `manifest.json`
- registro do SW para o caminho correto
- `basePath`/`assetPrefix` (se aplicável)

---

## 📄 Licença

Uso livre para fins educacionais e portfólio. Ajuste conforme sua necessidade.
