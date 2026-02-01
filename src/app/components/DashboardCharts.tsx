"use client";

import React from "react";

export function BalanceDonut({
  totalIn,
  totalOut
}: {
  totalIn: number;
  totalOut: number;
}) {
  const safeIn = Math.max(0, totalIn);
  const safeOut = Math.max(0, totalOut);

  // “red slice” = despesas / entradas (limitado a 100%)
  const ratio = safeIn > 0 ? Math.min(safeOut / safeIn, 1) : 0;

  const size = 180;
  const stroke = 18;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  const redLen = c * ratio;
  const greenLen = c - redLen;

  const balance = safeIn - safeOut;

  return (
    <div className="donutWrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut">
        {/* base */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className="donutBase"
          strokeWidth={stroke}
        />

        {/* verde (restante) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className="donutIn"
          strokeWidth={stroke}
          strokeDasharray={`${greenLen} ${c}`}
          strokeDashoffset={0}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />

        {/* vermelho (despesas) sobreposto */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className="donutOut"
          strokeWidth={stroke}
          strokeDasharray={`${redLen} ${c}`}
          strokeDashoffset={-greenLen}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />

        {/* texto central */}
        <text x="50%" y="48%" textAnchor="middle" className="donutTitle">
          Saldo
        </text>
        <text x="50%" y="62%" textAnchor="middle" className="donutValue">
          {formatBRL(balance)}
        </text>
      </svg>

      <div className="donutLegend">
        <div className="legendRow">
          <span className="dot in" />
          <span>Entradas</span>
          <strong>{formatBRL(safeIn)}</strong>
        </div>
        <div className="legendRow">
          <span className="dot out" />
          <span>Despesas</span>
          <strong>{formatBRL(safeOut)}</strong>
        </div>
      </div>
    </div>
  );
}

export type MonthPoint = {
  key: string;   // YYYY-MM
  label: string; // MM/YY
  in: number;
  out: number;
};

export function MonthlyBars({ data }: { data: MonthPoint[] }) {
  const w = 620;
  const h = 240;

  const padL = 42;
  const padR = 16;
  const padT = 20;
  const padB = 38;

  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const maxVal = Math.max(
    1,
    ...data.map((d) => Math.max(d.in, d.out))
  );

  const gridLines = 4;
  const ticks = Array.from({ length: gridLines + 1 }, (_, i) => i / gridLines);

  const n = data.length || 1;
  const groupW = plotW / n;
  const barW = Math.min(26, groupW * 0.28);
  const innerGap = Math.min(12, groupW * 0.12);

  const xForGroup = (i: number) => padL + i * groupW + groupW / 2;

  const yForVal = (v: number) => padT + plotH - (v / maxVal) * plotH;

  return (
    <div className="barsWrap">
      <svg viewBox={`0 0 ${w} ${h}`} className="barsSvg" role="img" aria-label="Evolução mensal">
        {/* grid */}
        {ticks.map((t) => {
          const y = padT + plotH * (1 - t);
          return (
            <g key={t}>
              <line x1={padL} x2={w - padR} y1={y} y2={y} className="gridLine" />
              <text x={padL - 8} y={y + 4} textAnchor="end" className="axisText">
                {formatCompact(maxVal * t)}
              </text>
            </g>
          );
        })}

        {/* barras */}
        {data.map((d, i) => {
          const cx = xForGroup(i);
          const inX = cx - barW - innerGap / 2;
          const outX = cx + innerGap / 2;

          const inY = yForVal(d.in);
          const outY = yForVal(d.out);

          const inH = padT + plotH - inY;
          const outH = padT + plotH - outY;

          return (
            <g key={d.key}>
              <rect x={inX} y={inY} width={barW} height={inH} rx={6} className="barIn" />
              <rect x={outX} y={outY} width={barW} height={outH} rx={6} className="barOut" />

              <text x={cx} y={padT + plotH + 22} textAnchor="middle" className="axisText">
                {d.label}
              </text>
            </g>
          );
        })}

        {/* legenda */}
        <g transform={`translate(${padL + 10}, ${h - 12})`}>
          <rect x="0" y="-10" width="10" height="10" rx="2" className="barIn" />
          <text x="16" y="-2" className="legendText">Entradas</text>

          <rect x="92" y="-10" width="10" height="10" rx="2" className="barOut" />
          <text x="108" y="-2" className="legendText">Despesas</text>
        </g>
      </svg>
    </div>
  );
}

/* helpers */
function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatCompact(v: number) {
  // 1500 -> 1.5k (pt-BR)
  if (v >= 1000) return (v / 1000).toFixed(1).replace(".", ",") + "k";
  return String(Math.round(v));
}
