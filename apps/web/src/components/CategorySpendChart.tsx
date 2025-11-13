"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import { CategorySpend } from "@/lib/api";

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategorySpendChartProps {
  data: CategorySpend[];
}

export default function CategorySpendChart({ data }: CategorySpendChartProps) {
  const colors = [
    "rgba(59, 130, 246, 0.8)",
    "rgba(16, 185, 129, 0.8)",
    "rgba(245, 158, 11, 0.8)",
    "rgba(239, 68, 68, 0.8)",
    "rgba(139, 92, 246, 0.8)",
    "rgba(236, 72, 153, 0.8)",
  ];

  const chartData = {
    labels: data.map((d) => d.category),
    datasets: [
      {
        label: "Spending",
        data: data.map((d) => d.amount),
        backgroundColor: colors.slice(0, data.length),
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
      },
      title: {
        display: true,
        text: "Spending by Category",
      },
    },
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="h-64">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
}

