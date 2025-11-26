"use client";
import React from "react";

export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <div className="h-20 bg-slate-100 rounded animate-pulse"></div>
        <div className="h-20 bg-slate-100 rounded animate-pulse"></div>
        <div className="h-20 bg-slate-100 rounded animate-pulse"></div>
        <div className="h-20 bg-slate-100 rounded animate-pulse"></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="h-64 bg-slate-100 rounded animate-pulse col-span-2"></div>
        <div className="h-64 bg-slate-100 rounded animate-pulse"></div>
      </div>
    </div>
  );
}
export default DashboardSkeleton;
