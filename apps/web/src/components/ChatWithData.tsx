"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { API_BASE_URL } from "@/lib/utils";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ChatResponse {
  sql: string;
  notes: string;
  results: any[];
}

export default function ChatWithData() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch(`${API_BASE_URL}/chat-with-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const data: ChatResponse = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const canAutoChart = (results: any[]): boolean => {
    if (results.length === 0) return false;
    const firstRow = results[0];
    const keys = Object.keys(firstRow);
    const hasDate = keys.some((k) => {
      const val = firstRow[k];
      return (
        typeof val === "string" &&
        (val.match(/^\d{4}-\d{2}-\d{2}/) || !isNaN(Date.parse(val)))
      );
    });
    const hasNumeric = keys.some((k) => {
      const val = firstRow[k];
      return typeof val === "number" || (!isNaN(parseFloat(val)) && isFinite(val));
    });
    return hasDate && hasNumeric;
  };

  const generateChartData = (results: any[]) => {
    if (results.length === 0) return null;

    const firstRow = results[0];
    const keys = Object.keys(firstRow);
    const dateKey = keys.find((k) => {
      const val = firstRow[k];
      return (
        typeof val === "string" &&
        (val.match(/^\d{4}-\d{2}-\d{2}/) || !isNaN(Date.parse(val)))
      );
    });
    const numericKey = keys.find((k) => {
      const val = firstRow[k];
      return typeof val === "number" || (!isNaN(parseFloat(val)) && isFinite(val));
    });

    if (!dateKey || !numericKey) return null;

    return {
      labels: results.map((r) => {
        const date = new Date(r[dateKey]);
        return date.toLocaleDateString();
      }),
      datasets: [
        {
          label: numericKey,
          data: results.map((r) => parseFloat(r[numericKey]) || 0),
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
        },
      ],
    };
  };

  const chartData = response?.results ? generateChartData(response.results) : null;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Chat with Data</h1>

      <Card>
        <CardHeader>
          <CardTitle>Ask a Question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="e.g., What are the top 5 vendors by total spend?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !question.trim()}>
              {loading ? "Processing..." : "Ask"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {response && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Generated SQL</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                <code>{response.sql}</code>
              </pre>
            </CardContent>
          </Card>

          {response.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{response.notes}</p>
              </CardContent>
            </Card>
          )}

          {response.results && response.results.length > 0 && (
            <>
              {canAutoChart(response.results) && chartData && (
                <Card>
                  <CardHeader>
                    <CardTitle>Visualization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Line data={chartData} options={{ responsive: true }} />
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Results ({response.results.length} rows)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {Object.keys(response.results[0]).map((key) => (
                            <TableHead key={key}>{key}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {response.results.map((row, idx) => (
                          <TableRow key={idx}>
                            {Object.values(row).map((val, i) => (
                              <TableCell key={i}>
                                {val === null || val === undefined
                                  ? "—"
                                  : String(val)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}


