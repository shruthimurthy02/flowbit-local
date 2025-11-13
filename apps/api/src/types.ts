// API Response Types

export interface StatsResponse {
  totalSpend: number;
  totalInvoicesProcessed: number;
  documentsUploaded: number; // Mock count
  averageInvoiceValue: number;
}

export interface InvoiceTrendItem {
  month: string; // YYYY-MM format
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
  customer: string;
  vendor: string;
  amount: number;
  status: string;
  issuedAt: string;
  dueDate: string | null;
  paidAt: string | null;
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
  question: string;
}

export interface ChatResponse {
  sql: string;
  notes: string;
  results: any[];
}
