"use client";

import { useState } from "react";
import { Loader2, SendHorizontal } from "lucide-react";

import { ChatAutoRenderer } from "@/components/chat/ChatAutoRenderer";
import { postChat } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ChatPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [sql, setSql] = useState<string | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setSql(null);
    setRows([]);

    try {
      const res = await postChat(prompt.trim());
      setSql(res.sql ?? null);
      setRows(res.rows ?? []);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Natural language queries</CardTitle>
          <CardDescription>
            Ask Flowbit to translate a finance question into SQL.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. List top 5 vendors by spend"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end">
            <Button onClick={handleSend} disabled={loading} className="gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
                </>
              ) : (
                <>
                  <SendHorizontal className="h-4 w-4" /> Send
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ChatAutoRenderer sql={sql ?? undefined} rows={rows} loading={loading} />
    </div>
  );
}
