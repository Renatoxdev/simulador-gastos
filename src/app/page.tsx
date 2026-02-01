"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PwaClient } from "./components/PwaClient";

type Kind = "in" | "out";

type Entry = {
  id: string;
  kind: Kind;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  amount: number; // sempre positivo; kind define sinal
  createdAt: number;
};

const STORAGE_KEY = "simulador_gastos_entries_v1";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now());
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function isValidEntry(x: any): x is Entry {
  return (
    x &&
    typeof x === "object" &&
    (x.kind === "in" || x.kind === "out") &&
    typeof x.id === "string" &&
    typeof x.title === "string" &&
    typeof x.description === "string" &&
    typeof x.date === "string" &&
    typeof x.amount === "number" &&
    Number.isFinite(x.amount) &&
    x.amount >= 0 &&
    typeof x.createdAt === "number" &&
    Number.isFinite(x.createdAt)
  );
}

type BackupFile = {
  version: 1;
  exportedAt: string; // ISO
  entries: Entry[];
};


function Column({
  kind,
  entries,
  onAdd,
  onRemove
}: {
  kind: Kind;
  entries: Entry[];
  onAdd: (e: Omit<Entry, "id" | "createdAt">) => void;
  onRemove: (id: string) => void;
}) {
  const isIn = kind === "in";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayISO());
  const [amount, setAmount] = useState<string>("");

  const header = isIn ? "Entradas" : "Saídas";
  const hint = isIn ? "Salário, investimento, etc." : "Contas, compras, etc.";

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();

    const value = Number(String(amount).replace(",", "."));
    if (!title.trim()) return;
    if (!Number.isFinite(value) || value <= 0) return;
    if (!date) return;

    onAdd({
      kind,
      title: title.trim(),
      description: description.trim(),
      date,
      amount: value
    });

    setTitle("");
    setDescription("");
    setAmount("");
    setDate(todayISO());
  };

  return (
    <section className={`col ${isIn ? "colIn" : "colOut"}`}>
      <header className="colHeader">
        <div>
          <h2>{header}</h2>
          <p className="muted">{hint}</p>
        </div>
      </header>

      <form className="form" onSubmit={submit}>
        <label className="field">
          <span>Título</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Salário" />
        </label>

        <label className="field">
          <span>Descrição</span>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Opcional"
          />
        </label>

        <div className="row">
          <label className="field">
            <span>Data</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>

          <label className="field">
            <span>Valor</span>
            <input
              inputMode="decimal"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
        </div>

        <button className="primary" type="submit">
          Adicionar
        </button>
      </form>

      <div className="list">
        {entries.length === 0 ? (
          <p className="muted empty">Sem itens ainda.</p>
        ) : (
          entries
            .slice()
            .sort((a, b) => (a.date === b.date ? b.createdAt - a.createdAt : b.date.localeCompare(a.date)))
            .map((e) => (
              <article className="card" key={e.id}>
                <div className="cardTop">
                  <div className="cardTitle">
                    <strong>{e.title}</strong>
                    <span className="pill">{e.date}</span>
                  </div>
                  <div className="cardValue">{formatBRL(e.amount)}</div>
                </div>

                {e.description ? <p className="muted">{e.description}</p> : null}

                <button className="danger" type="button" onClick={() => onRemove(e.id)}>
                  Remover
                </button>
              </article>
            ))
        )}
      </div>
    </section>
  );
}

export default function Page() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const hydrated = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [backupMsg, setBackupMsg] = useState<string>("");

  const clearAll = () => {
  const ok = window.confirm(
    "Tem certeza que deseja apagar TODOS os lançamentos?\n\nEssa ação não pode ser desfeita. Dica: exporte um backup antes."
  );
  if (!ok) return;

  setEntries([]);

  localStorage.removeItem(STORAGE_KEY);

  setBackupMsg("Todos os lançamentos foram apagados.");
  setTimeout(() => setBackupMsg(""), 3500);
};


  // Carregar do localStorage
  useEffect(() => {
    const stored = safeParse<Entry[]>(localStorage.getItem(STORAGE_KEY), []);
    setEntries(Array.isArray(stored) ? stored : []);
    hydrated.current = true;
  }, []);

  // Persistir no localStorage
  useEffect(() => {
    if (!hydrated.current) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const addEntry = (payload: Omit<Entry, "id" | "createdAt">) => {
    const entry: Entry = { ...payload, id: newId(), createdAt: Date.now() };
    setEntries((prev) => [entry, ...prev]);
  };

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const exportBackup = () => {
  const payload: BackupFile = {
    version: 1,
    exportedAt: new Date().toISOString(),
    entries
  };

  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  downloadJson(`gastos-backup-${yyyy}-${mm}-${dd}.json`, payload);
  setBackupMsg("Backup exportado.");
  setTimeout(() => setBackupMsg(""), 2500);
};

const openImportPicker = () => {
  setBackupMsg("");
  fileInputRef.current?.click();
};

const onImportFile = async (file: File) => {
  const text = await file.text();
  const data = safeParse<any>(text, null);

  const importedEntries: any[] =
    data && typeof data === "object" && Array.isArray(data.entries)
      ? data.entries
      : Array.isArray(data)
      ? data
      : [];

  if (!Array.isArray(importedEntries) || importedEntries.length === 0) {
    setBackupMsg("Arquivo inválido ou vazio.");
    setTimeout(() => setBackupMsg(""), 3500);
    return;
  }

  const valid = importedEntries.filter(isValidEntry);

  if (valid.length === 0) {
    setBackupMsg("Nenhum lançamento válido encontrado no JSON.");
    setTimeout(() => setBackupMsg(""), 3500);
    return;
  }

  setEntries((prev) => {
    const byId = new Map<string, Entry>();
    for (const e of prev) byId.set(e.id, e);
    for (const e of valid) byId.set(e.id, e);
    return Array.from(byId.values());
  });

  setBackupMsg(`Importado: ${valid.length} lançamento(s).`);
  setTimeout(() => setBackupMsg(""), 3500);
};

  const incomes = useMemo(() => entries.filter((e) => e.kind === "in"), [entries]);
  const outcomes = useMemo(() => entries.filter((e) => e.kind === "out"), [entries]);

  const totalIn = useMemo(() => incomes.reduce((acc, e) => acc + e.amount, 0), [incomes]);
  const totalOut = useMemo(() => outcomes.reduce((acc, e) => acc + e.amount, 0), [outcomes]);
  const balance = totalIn - totalOut;

  return (
    <main className="page">
      <header className="topbar">
        <div className="brand">
          <h1>Simulador de Gastos</h1>
          <p className="muted">Funciona offline (PWA) e salva num arquivo JSOn.</p>
          {backupMsg ? <p className="muted">{backupMsg}</p> : null}
        </div>

        <div className="actions">
          <button type="button" onClick={exportBackup}>
            Exportar JSON
          </button>

          <button type="button" onClick={openImportPicker}>
            Importar JSON
          </button>

          <button type="button" className="danger" onClick={clearAll}>
            Limpar tudo
          </button>

          <PwaClient />

    <input
      ref={fileInputRef}
      type="file"
      accept="application/json"
      style={{ display: "none" }}
      onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) onImportFile(f);
      e.currentTarget.value = "";
    }}
  />
</div>
      </header>

      <section className="grid">
        <Column kind="in" entries={incomes} onAdd={addEntry} onRemove={removeEntry} />
        <Column kind="out" entries={outcomes} onAdd={addEntry} onRemove={removeEntry} />
      </section>

      <footer className="saldo">
        <div className="saldoBox">
          <div className="saldoRow">
            <span className="muted">Total entradas</span>
            <strong>{formatBRL(totalIn)}</strong>
          </div>
          <div className="saldoRow">
            <span className="muted">Total saídas</span>
            <strong>{formatBRL(totalOut)}</strong>
          </div>
          <div className="divider" />
          <div className="saldoRow big">
            <span>Saldo</span>
            <strong className={balance >= 0 ? "pos" : "neg"}>{formatBRL(balance)}</strong>
          </div>
        </div>
      </footer>
    </main>
  );
}
