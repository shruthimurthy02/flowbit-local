"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { CashOutflow } from "@/lib/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CashOutflowChartProps {
  data: CashOutflow;
}

export default function CashOutflowChart({ data }: CashOutflowChartProps) {
  const chartData = {
    labels: data.daily.map((d) => d.date),
    datasets: [
      {
        label: "Daily Cash Outflow",
        data: data.daily.map((d) => d.amount),
        backgroundColor: "rgba(239, 68, 68, 0.8)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `Cash Outflow (Total: $${data.total.toLocaleString()})`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

