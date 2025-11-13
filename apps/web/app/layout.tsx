import "./globals.css";

export const metadata = {
  title: "Flowbit Dashboard",
  description: "Analytics Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <aside style={{ width: 240, background: "#0f172a", color: "#fff", padding: 20 }}>
            <h2>Flowbit</h2>
            <nav>
              <a href="/" style={{ color: "#9ca3af", display: "block", margin: "8px 0" }}>Dashboard</a>
              <a href="/chat" style={{ color: "#9ca3af", display: "block", margin: "8px 0" }}>Chat with Data</a>
            </nav>
          </aside>
          <main style={{ flex: 1, padding: 24 }}>{children}</main>
        </div>
      </body>
    </html>
  );
}

