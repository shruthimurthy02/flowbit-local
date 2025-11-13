import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface StatsResponse {
  totalSpend: number;
  totalInvoicesProcessed: number;
  documentsUploaded: number;
  averageInvoiceValue: number;
  pendingInvoices?: number;
  paidInvoices?: number;
  overdueInvoices?: number;
}

export interface InvoiceTrendItem {
  month: string;
  invoiceCount: number;
  totalSpend: number;
}

export interface TopVendor {
  vendor: string;
  totalSpend: number;
  invoiceCount: number;
}

export interface CategorySpend {
  category: string;
  totalSpend: number;
  invoiceCount: number;
}

export interface CashOutflowItem {
  dueDateRange: string;
  totalAmount: number;
  invoiceCount: number;
}

export interface InvoiceListItem {
  id: string;
  invoiceNumber?: string;
  vendor: string;
  customer: string;
  date: string;
  issuedAt: string;
  dueDate: string | null;
  amount: number;
  status: string;
}

export interface InvoicesResponse {
  invoices: InvoiceListItem[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export interface ChatRequest {
  query?: string;
  question?: string;
}

export interface ChatResponse {
  sql: string;
  notes: string;
  results: any[];
  data?: any[];
}

// API functions
export const apiClient = {
  getStats: () => api.get<StatsResponse>("/stats"),
  getInvoiceTrends: () => api.get<InvoiceTrendItem[]>("/invoice-trends"),
  getTopVendors: () => api.get<TopVendor[]>("/vendors/top10"),
  getCategorySpend: () => api.get<CategorySpend[]>("/category-spend"),
  getCashOutflow: () => api.get<CashOutflowItem[]>("/cash-outflow"),
  getInvoices: (params?: {
    page?: number;
    per_page?: number;
    q?: string;
    status?: string;
    sort?: string;
    order?: "asc" | "desc";
  }) => api.get<InvoicesResponse>("/invoices", { params }),
  chatWithData: (question: string) =>
    api.post<ChatResponse>('/chat-with-data', { question }),
};

export default api;
