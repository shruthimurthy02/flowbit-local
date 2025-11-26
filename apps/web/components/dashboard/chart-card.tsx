"use client";
import React from "react";

export function ChartCard({ title, children }: { title?: string; children?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      {title && <div className="text-sm text-slate-500 mb-2">{title}</div>}
      <div>{children}</div>
    </div>
  );
}
export default ChartCard;
