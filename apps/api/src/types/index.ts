// Type definitions for API responses

export interface StatsResponse {
  totalSpend: number;
  totalInvoicesProcessed: number;
  documentsUploaded: number;
  averageInvoiceValue: number;
  pendingInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
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
  vendor: {
    id: string;
    name: string;
    email: string | null;
  };
  customer: {
    id: string;
    name: string;
    email: string;
  };
  date: string;
  dueDate: string | null;
  amount: number;
  status: string;
}

export interface InvoicesResponse {
  page: number;
  per_page: number;
  total: number;
  totalPages: number;
  data: InvoiceListItem[];
}

export interface ChatRequest {
  question: string;
}

export interface ChatResponse {
  sql: string;
  notes: string;
  results: any[];
}

