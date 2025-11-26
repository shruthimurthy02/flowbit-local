const RAW_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

export const BASE_URL = RAW_BASE.replace(/\/$/, "");

type QueryParams = Record<string, string | number | boolean | undefined | null>;

type FetchJsonOptions = RequestInit & {
  query?: QueryParams;
};

function buildUrl(path: string, query?: QueryParams) {
  const url = new URL(`${BASE_URL}${path}`);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

export async function fetchJson<T>(
  path: string,
  options: FetchJsonOptions = {}
): Promise<T> {
  const { query, headers, body, ...rest } = options;
  const url = buildUrl(path, query);

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body,
    ...rest,
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(details || `Failed to fetch ${path}`);
  }

  return (await response.json()) as T;
}

export function fetchStats() {
  return fetchJson<any>("/stats");
}

export function fetchInvoiceTrends(params?: { months?: number }) {
  return fetchJson<any[]>("/invoice-trends", {
    query: { months: params?.months ?? 12 },
  });
}

export function fetchTopVendors(params?: { limit?: number }) {
  return fetchJson<any[]>("/vendors/top10", {
    query: { limit: params?.limit ?? 10 },
  });
}

export function fetchCategorySpend() {
  return fetchJson<any[]>("/category-spend");
}

export async function fetchCashOutflow(params?: { days?: number }) {
  const data = await fetchJson<Array<{ date: string; total?: number }>>(
    "/cash-outflow",
    { query: { days: params?.days ?? 30 } }
  );

  return data.map((row) => ({
    date: row.date,
    expectedAmount: Number(row.total ?? 0),
  }));
}

export function fetchInvoices(params: QueryParams = {}) {
  return fetchJson("/invoices", { query: params });
}

export function postChat(prompt: string) {
  return fetchJson("/chat-with-data", {
    method: "POST",
    body: JSON.stringify({ prompt }),
  });
}
