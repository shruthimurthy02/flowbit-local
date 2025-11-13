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
import { TopVendor } from "@/lib/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TopVendorsChartProps {
  data: TopVendor[];
}

export default function TopVendorsChart({ data }: TopVendorsChartProps) {
  const chartData = {
    labels: data.map((d) => d.name),
    datasets: [
      {
        label: "Total Amount",
        data: data.map((d) => d.totalAmount),
        backgroundColor: "rgba(139, 92, 246, 0.8)",
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
        text: "Top 10 Vendors by Revenue",
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

