"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, MessageSquare, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();

  const isDashboard = pathname === "/dashboard" || pathname === "/";
  const isChat = pathname === "/chat-with-data";

  return (
    <aside className="w-64 bg-[#1e293b] text-white flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-white font-bold">
            B
          </div>
          <h1 className="text-lg font-semibold">Flowbit AI Dashboard</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <div className="mb-6">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2 px-3">
            Buchhaltung
          </div>
          <div className="text-sm text-gray-300 px-3">12 members</div>
        </div>

        <div className="mb-6">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2 px-3">
            GENERAL
          </div>
          <Link
            href="/dashboard"
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
              isDashboard
                ? "bg-purple-600 text-white"
                : "text-gray-300 hover:bg-gray-700"
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/chat-with-data"
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors mt-1",
              isChat
                ? "bg-purple-600 text-white"
                : "text-gray-300 hover:bg-gray-700"
            )}
          >
            <MessageSquare className="w-5 h-5" />
            <span>Chat with Data</span>
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <GraduationCap className="w-4 h-4" />
          <span>Flowbit AI</span>
        </div>
      </div>
    </aside>
  );
}
