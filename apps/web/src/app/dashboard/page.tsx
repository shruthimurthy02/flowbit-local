"use client";

import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  useEffect(() => {
    // Redirect to main dashboard
    redirect("/");
  }, []);
  
  return null;
}
