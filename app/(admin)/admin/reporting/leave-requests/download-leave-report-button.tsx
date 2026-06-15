"use client";

import * as XLSX from "xlsx";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { getLeaveReportData } from "../actions";

export function DownloadLeaveReportButton({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    setIsDownloading(true);

    try {
      const leaveRequests = await getLeaveReportData(searchParams);
      const formattedRows = leaveRequests.map((row) => ({
        "Student Name": row.student.user.name,
        "Registration No": row.student.registrationNo,
        Department: row.student.department,
        Subject: row.offering.subject.name,
        "Subject Code": row.offering.subject.code,
        "Reason / Title": row.reasonTitle,
        "Leave Date": formatDate(row.date),
        "Requested On": formatDate(row.createdAt),
        Status: row.status,
      }));

      const ws = XLSX.utils.json_to_sheet(formattedRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Leave Requests");
      const exportDate = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `lr-report-${exportDate}.xlsx`);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <Button type="button" onClick={handleDownload} disabled={isDownloading}>
      {isDownloading ? "Preparing export..." : "Download data"}
    </Button>
  );
}
