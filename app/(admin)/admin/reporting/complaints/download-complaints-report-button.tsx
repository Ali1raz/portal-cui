"use client";

import * as XLSX from "xlsx";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { getComplaintsReportData } from "../actions";

export function DownloadComplaintsReportButton({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    setIsDownloading(true);

    try {
      const complaints = await getComplaintsReportData(searchParams);

      const formattedRows = complaints.map((row) => ({
        "Student Name": row.student.user.name,
        "Registration No": row.student.registrationNo,
        Department: row.student.department,
        Title: row.title,
        Category: row.category,
        Status: row.status,
        "Created At": formatDate(row.createdAt),
      }));

      const ws = XLSX.utils.json_to_sheet(formattedRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Complaints");
      const exportDate = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `complaints-report-${exportDate}.xlsx`);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <Button type="button" onClick={handleDownload} disabled={isDownloading}>
      {isDownloading ? "Preparing export..." : "Download filtered data"}
    </Button>
  );
}
