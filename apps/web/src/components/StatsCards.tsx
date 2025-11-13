"use client";

import { DollarSign, FileText, Clock, AlertCircle, Building2, Users } from "lucide-react";
import { Stats } from "@/lib/api";

interface StatsCardsProps {
  stats: Stats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Total Invoices",
      value: stats.totalInvoices.toString(),
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "Pending Invoices",
      value: stats.pendingInvoices.toString(),
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "Overdue Invoices",
      value: stats.overdueInvoices.toString(),
      icon: AlertCircle,
      color: "text-red-600",
    },
    {
      title: "Total Vendors",
      value: stats.totalVendors.toString(),
      icon: Building2,
      color: "text-purple-600",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers.toString(),
      icon: Users,
      color: "text-indigo-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-card border border-border rounded-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold mt-2">{card.value}</p>
              </div>
              <Icon className={`w-8 h-8 ${card.color}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

