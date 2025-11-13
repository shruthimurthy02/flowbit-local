"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Send, Loader2, Code, Database, AlertCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Types
interface ChatMessage {
  id: string;
  type: "user" | "assistant" | "error";
  question?: string;
  sql?: string;
  notes?: string;
  results?: any[];
  error?: string;
  timestamp: Date;
}

interface QueryResponse {
  sql: string;
  notes: string;
  results: any[];
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

export default function ChatWithDataPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      question: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const question = input.trim();
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/chat-with-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: question }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data: QueryResponse = await response.json();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: "assistant",
        sql: data.sql,
        notes: data.notes,
        results: data.results || data.data || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: "error",
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const canRenderChart = (results: any[]): boolean => {
    if (!results || results.length === 0) return false;
    const firstRow = results[0];
    const keys = Object.keys(firstRow);

    // Check for numeric values
    const hasNumeric = keys.some((k) => {
      const val = firstRow[k];
      return (
        typeof val === "number" ||
        (!isNaN(parseFloat(val)) && isFinite(val) && val !== null)
      );
    });

    // Check for string labels or dates
    const hasLabel = keys.some((k) => {
      const val = firstRow[k];
      return typeof val === "string" && (val.length < 50 || !isNaN(Date.parse(val)));
    });

    return hasNumeric && hasLabel && results.length > 0;
  };

  const prepareChartData = (results: any[]) => {
    if (!results || results.length === 0) return null;

    const keys = Object.keys(results[0]);
    const numericKey = keys.find((k) => {
      const val = results[0][k];
      return (
        typeof val === "number" ||
        (!isNaN(parseFloat(val)) && isFinite(val) && val !== null)
      );
    });
    const labelKey =
      keys.find((k) => {
        const val = results[0][k];
        return typeof val === "string" && k !== numericKey;
      }) || keys[0];

    return {
      data: results.map((row) => ({
        name: String(row[labelKey] || "").substring(0, 30),
        value:
          typeof row[numericKey] === "number"
            ? row[numericKey]
            : parseFloat(row[numericKey]) || 0,
      })),
      labelKey,
      valueKey: numericKey || keys[0],
    };
  };

  return (
    <div className="flex flex-col h-[calc(100vh-0px)] bg-background">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4 flex-shrink-0">
        <h1 className="text-2xl font-bold">Chat with Data</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ask questions about your invoices and analytics data
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md space-y-4">
              <Database className="w-16 h-16 mx-auto text-muted-foreground" />
              <h2 className="text-xl font-semibold">Start a conversation</h2>
              <p className="text-muted-foreground">Ask questions like:</p>
              <ul className="text-sm text-muted-foreground space-y-2 text-left list-disc list-inside">
                <li>What are the top 5 vendors by total spend?</li>
                <li>Show me all overdue invoices</li>
                <li>What is the total revenue this month?</li>
                <li>Which customers have the most invoices?</li>
              </ul>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-3xl rounded-lg px-4 py-3 ${
                message.type === "user"
                  ? "bg-primary text-primary-foreground"
                  : message.type === "error"
                  ? "bg-destructive/10 text-destructive border border-destructive/20"
                  : "bg-muted"
              }`}
            >
              {message.type === "user" && (
                <div className="font-medium">{message.question}</div>
              )}

              {message.type === "error" && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{message.error}</span>
                </div>
              )}

              {message.type === "assistant" && (
                <div className="space-y-4">
                  {message.sql && (
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                        <Code className="w-4 h-4" />
                        <span>Generated SQL</span>
                      </div>
                      <pre className="bg-background/50 rounded-md p-3 text-xs overflow-x-auto border">
                        <code>{message.sql}</code>
                      </pre>
                    </div>
                  )}

                  {message.notes && (
                    <div className="text-sm italic text-muted-foreground">
                      {message.notes}
                    </div>
                  )}

                  {message.results && message.results.length > 0 && (
                    <div className="space-y-3">
                      {/* Chart */}
                      {canRenderChart(message.results) && (
                        <Card>
                          <CardContent className="pt-6">
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart
                                data={prepareChartData(message.results)?.data || []}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                  dataKey="name"
                                  angle={-45}
                                  textAnchor="end"
                                  height={80}
                                />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar
                                  dataKey="value"
                                  fill="hsl(var(--primary))"
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      )}

                      {/* Results Table */}
                      <div>
                        <div className="text-sm font-medium mb-2">
                          Results ({message.results.length}{" "}
                          {message.results.length === 1 ? "row" : "rows"})
                        </div>
                        <div className="border rounded-md overflow-hidden">
                          <div className="overflow-x-auto max-h-96 overflow-y-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  {Object.keys(message.results[0]).map((key) => (
                                    <TableHead key={key} className="whitespace-nowrap">
                                      {key}
                                    </TableHead>
                                  ))}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {message.results.map((row, idx) => (
                                  <TableRow key={idx}>
                                    {Object.values(row).map((val: any, i: number) => (
                                      <TableCell key={i} className="whitespace-nowrap">
                                        {val === null || val === undefined
                                          ? "—"
                                          : typeof val === "number"
                                          ? val.toLocaleString()
                                          : String(val)}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {message.results && message.results.length === 0 && (
                    <div className="text-sm text-muted-foreground">
                      No results found.
                    </div>
                  )}
                </div>
              )}

              <div className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing your question...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-card px-4 py-4 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your data..."
            disabled={loading}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Press Enter to send
        </p>
      </div>
    </div>
  );
}
