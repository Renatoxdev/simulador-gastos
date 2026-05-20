"use client";

import { useEffect, useMemo, useState } from "react";
import { PwaClient } from "./components/PwaClient";
import { ThemeToggle } from "./components/ThemeToggle";
import {
  BalanceDonut,
  MonthlyBars,
  type MonthPoint
} from "./components/DashboardCharts";
import {
  criarGasto,
  criarRenda,
  deletarGasto,
  deletarRenda,
  listarGastos,
  listarRendas,
  type Gasto,
  type Renda
} from "../services/api";

type Kind = "in" | "out";

type Entry = {
  id: number;
  kind: Kind;
  title: string;
  description: string;
  date: string;
  amount: number;
};

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function gastoToEntry(gasto: Gasto): Entry {
  return {
    id: gasto.id,
    kind: "out",
    title: gasto.nome,
    description: gasto.descricao || "",
    date: gasto.data,
    amount: gasto.valor
  };
}

function rendaToEntry(renda: Renda): Entry {
  return {
    id: renda.id,
    kind: "in",
    title: renda.nome,
    description: renda.descricao || "",
    date: renda.data,
    amount: renda.valor
  };
}

function Column({
  kind,
  entries,
  onAdd,
  onRemove
}: {
  kind: Kind;
  entries: Entry[];
  onAdd: (e: Omit<Entry, "id">) => Promise<void>;
  onRemove: (entry: Entry) => Promise<void>;
}) {
  const isIn = kind === "in";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayISO());
  const [amount, setAmount] = useState("");

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();

    const value = Number(String(amount).replace(",", "."));

    if (!title.trim()) return;
    if (!Number.isFinite(value) || value <= 0) return;

    await onAdd({
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
        <h2>{isIn ? "Rendas" : "Gastos"}</h2>
      </header>

      <form className="form" onSubmit={submit}>
        <label className="field">
          <span>Título</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={isIn ? "Ex: Salário" : "Ex: Mercado"}
          />
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
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
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
          entries.map((entry) => (
            <article className="card" key={`${entry.kind}-${entry.id}`}>
              <div className="cardTop">
                <div className="cardTitle">
                  <strong>{entry.title}</strong>
                  <span className="pill">{entry.date}</span>
                </div>

                <div className="cardValue">
                  {formatBRL(entry.amount)}
                </div>
              </div>

              {entry.description ? (
                <p className="muted">{entry.description}</p>
              ) : null}

              <button
                className="danger"
                type="button"
                onClick={() => onRemove(entry)}
              >
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
  const [status, setStatus] = useState("Carregando dados...");

  useEffect(() => {
    async function carregarLancamentos() {
      try {
        const [gastos, rendas] = await Promise.all([
          listarGastos(),
          listarRendas()
        ]);

        setEntries([
          ...rendas.map(rendaToEntry),
          ...gastos.map(gastoToEntry)
        ]);
        setStatus("");
      } catch (error) {
        console.error(error);
        setStatus("Não foi possível conectar com a API FastAPI.");
      }
    }

    carregarLancamentos();
  }, []);

  const addEntry = async (payload: Omit<Entry, "id">) => {
    try {
      const data = {
        nome: payload.title,
        descricao: payload.description || undefined,
        valor: payload.amount,
        data: payload.date
      };

      const created =
        payload.kind === "in"
          ? rendaToEntry(await criarRenda(data))
          : gastoToEntry(await criarGasto(data));

      setEntries((prev) => [created, ...prev]);
      setStatus("");
    } catch (error) {
      console.error(error);
      setStatus("Erro ao salvar lançamento.");
    }
  };

  const removeEntry = async (entry: Entry) => {
    try {
      if (entry.kind === "in") {
        await deletarRenda(entry.id);
      } else {
        await deletarGasto(entry.id);
      }

      setEntries((prev) =>
        prev.filter(
          (item) => item.id !== entry.id || item.kind !== entry.kind
        )
      );
    } catch (error) {
      console.error(error);
      setStatus("Erro ao remover lançamento.");
    }
  };

  const exportBackup = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            version: 1,
            exportedAt: new Date().toISOString(),
            entries
          },
          null,
          2
        )
      ],
      { type: "application/json;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "backup-gastos.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const incomes = useMemo(
    () => entries.filter((e) => e.kind === "in"),
    [entries]
  );

  const outcomes = useMemo(
    () => entries.filter((e) => e.kind === "out"),
    [entries]
  );

  const totalIn = useMemo(
    () => incomes.reduce((acc, e) => acc + e.amount, 0),
    [incomes]
  );

  const totalOut = useMemo(
    () => outcomes.reduce((acc, e) => acc + e.amount, 0),
    [outcomes]
  );

  const balance = totalIn - totalOut;

  const monthly: MonthPoint[] = useMemo(() => {
    const map = new Map<string, { in: number; out: number }>();

    for (const entry of entries) {
      const [yyyy, mm] = entry.date.split("-");
      const key = `${yyyy}-${mm}`;
      const acc = map.get(key) || { in: 0, out: 0 };

      if (entry.kind === "in") {
        acc.in += entry.amount;
      } else {
        acc.out += entry.amount;
      }

      map.set(key, acc);
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => {
        const [yyyy, mm] = key.split("-");

        return {
          key,
          label: `${mm}/${yyyy.slice(2)}`,
          in: value.in,
          out: value.out
        };
      });
  }, [entries]);

  return (
    <main className="page">
      <header className="topbar">
        <div className="brand">
          <h1>Simulador de Gastos</h1>
          <p className="muted">Sistema conectado com FastAPI e SQLite</p>
          {status ? <p className="muted">{status}</p> : null}
        </div>

        <div className="actions">
          <button type="button" onClick={exportBackup}>
            Exportar JSON
          </button>

          <ThemeToggle />
          <PwaClient />
        </div>
      </header>

      <section className="dashGrid">
        <div className="dashCard">
          <div className="dashHead">
            <h3>Balanço atual</h3>
            <p className="muted">Visão geral financeira.</p>
          </div>

          <BalanceDonut totalIn={totalIn} totalOut={totalOut} />
        </div>

        <div className="dashCard">
          <div className="dashHead">
            <h3>Evolução mensal</h3>
          </div>

          <MonthlyBars data={monthly} />
        </div>
      </section>

      <section className="grid">
        <Column
          kind="in"
          entries={incomes}
          onAdd={addEntry}
          onRemove={removeEntry}
        />

        <Column
          kind="out"
          entries={outcomes}
          onAdd={addEntry}
          onRemove={removeEntry}
        />
      </section>

      <footer className="saldo">
        <div className="saldoBox">
          <div className="saldoRow">
            <span className="muted">Total rendas</span>
            <strong>{formatBRL(totalIn)}</strong>
          </div>

          <div className="saldoRow">
            <span className="muted">Total gastos</span>
            <strong>{formatBRL(totalOut)}</strong>
          </div>

          <div className="divider" />

          <div className="saldoRow big">
            <span>Saldo</span>
            <strong className={balance >= 0 ? "pos" : "neg"}>
              {formatBRL(balance)}
            </strong>
          </div>
        </div>
      </footer>
    </main>
  );
}
