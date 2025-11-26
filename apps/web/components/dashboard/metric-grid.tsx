"use client";
import React from "react";

export function MetricGrid({ children }: { children?: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{children}</div>;
}
export default MetricGrid;
