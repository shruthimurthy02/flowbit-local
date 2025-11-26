"use client";
import React from "react";

export function ErrorBlock({ message }: { message?: string }) {
  return (
    <div className="p-3 rounded-md bg-red-50 border border-red-100 text-red-800">
      <div className="font-medium">Error</div>
      <div className="text-sm mt-1">{message ?? "An unexpected error occurred."}</div>
    </div>
  );
}

export default ErrorBlock;
