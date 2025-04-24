"use client";

import { DAILY_SCAN_LIMIT } from "@/lib/constants";
import { CircleAlert } from "lucide-react";

type QuotaIndicatorProps = {
  dailyRemaining: number;
  monthlyRemaining: number;
};

export default function QuotaIndicator({
  dailyRemaining,
  monthlyRemaining,
}: QuotaIndicatorProps) {
  return (
    <span className="space-y-3 mb-4">
      Upload an image of your receipt to add multiple items. Scan up to{" "}
      {DAILY_SCAN_LIMIT} receipts per day
      <span className="font-bold"> ({dailyRemaining} remaining)</span> .
      <span className="flex items-center text-xs text-muted-foreground">
        <CircleAlert className="mr-2" />
        <span>
          There is a shared limit of 450 scans per month
          <span className="font-semibold"> ({monthlyRemaining} remaining)</span>
          .
        </span>
      </span>
    </span>
  );
}
