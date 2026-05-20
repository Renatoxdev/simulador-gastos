const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type LancamentoInput = {
  nome: string;
  valor: number;
  data: string;
  descricao?: string;
};

export type Gasto = LancamentoInput & {
  id: number;
};

export type Renda = LancamentoInput & {
  id: number;
};

async function request<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    }
  });

  if (!response.ok) {
    throw new Error(`Erro na API: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export function listarGastos() {
  return request<Gasto[]>("/gastos");
}

export function criarGasto(data: LancamentoInput) {
  return request<Gasto>("/gastos", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export function deletarGasto(id: number) {
  return request<void>(`/gastos/${id}`, {
    method: "DELETE"
  });
}

export function listarRendas() {
  return request<Renda[]>("/rendas");
}

export function criarRenda(data: LancamentoInput) {
  return request<Renda>("/rendas", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export function deletarRenda(id: number) {
  return request<void>(`/rendas/${id}`, {
    method: "DELETE"
  });
}
