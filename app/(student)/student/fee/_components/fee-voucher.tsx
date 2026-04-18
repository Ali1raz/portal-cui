"use client";

import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SITE_INFO } from "@/lib/data/SITE";

export interface VoucherData {
  voucherId: string;
  studentName?: string;
  installmentNo: number;
  amount: number;
  dueDate: string;
  printedAt?: string;
  /** Optional: school / institution name */
  institutionName?: string;
}

export interface FullFeeVoucherData {
  voucherId: string;
  totalAmount: number;
  printedAt?: string;
  studentName?: string;
  institutionName?: string;
  installments: VoucherData[];
}

interface FeeVoucherTemplateProps {
  /** Unique id used by saveAsPdf to locate this element */
  id: string;
  data: VoucherData;
}

function formatAmount(amount: number): string {
  return Number(amount).toLocaleString("en-US", {
    style: "currency",
    currency: "PKR",
  });
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function FeeVoucherTemplate({ id, data }: FeeVoucherTemplateProps) {
  const {
    voucherId,
    installmentNo,
    amount,
    dueDate,
    printedAt = new Date().toISOString(),
    institutionName = SITE_INFO.name,
    studentName,
  } = data;

  return (
    <div
      id={id}
      className="bg-white text-gray-900 font-sans"
      style={{ width: "794px", minHeight: "400px", padding: "40px" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b-2 border-blue-700 pb-5 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-700 tracking-tight">
            {institutionName}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Fee Payment Voucher</p>
        </div>
        <div className="text-right">
          <span className="inline-block bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded-full tracking-widest uppercase">
            Voucher
          </span>
          <p className="text-sm text-gray-500 mt-1.5">
            #{voucherId.slice(0, 8).toUpperCase()}
          </p>
        </div>
      </div>

      {/* Meta row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Installment", value: `#${installmentNo}` },
          {
            label: "Due Date",
            value: formatDate(dueDate),
          },
          {
            label: "Print Date",
            value: formatDate(printedAt),
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-gray-50 border border-gray-200 rounded-lg p-4"
          >
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              {label}
            </p>
            <p className="text-sm font-semibold text-gray-800">{value}</p>
          </div>
        ))}
      </div>

      {/* Student row */}
      {studentName && (
        <div className="mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Student
          </p>
          <p className="text-lg font-semibold">{studentName}</p>
        </div>
      )}

      {/* Amount */}
      <div className="bg-blue-700 rounded-xl p-6 mb-8 flex items-center justify-between">
        <div>
          <p className="text-blue-200 text-sm uppercase tracking-wider">
            Amount Due
          </p>
          <p className="text-4xl font-bold text-white mt-1">
            {formatAmount(amount)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-blue-200 text-xs">Installment</p>
          <p className="text-white text-2xl font-bold">
            {installmentNo}
            <span className="text-blue-300 text-base ml-1">/ inst.</span>
          </p>
        </div>
      </div>

      {/* Payment info table */}
      <Table className="w-full text-sm border-collapse mb-8">
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="text-left px-4 py-2.5 text-gray-600 font-semibold border border-gray-200">
              Description
            </TableHead>
            <TableHead className="text-right px-4 py-2.5 text-gray-600 font-semibold border border-gray-200">
              Amount
            </TableHead>
          </TableRow>
        </TableHeader>
        <tbody>
          <tr>
            <td className="px-4 py-3 border border-gray-200">
              Fee Installment #{installmentNo}
            </td>
            <td className="px-4 py-3 text-right border border-gray-200 font-medium">
              {formatAmount(amount)}
            </td>
          </tr>
          <tr className="bg-gray-50 font-bold">
            <td className="px-4 py-3 border border-gray-200">Total</td>
            <td className="px-4 py-3 text-right border border-gray-200 text-blue-700">
              {formatAmount(amount)}
            </td>
          </tr>
        </tbody>
      </Table>

      {/* Footer */}
      <div className="border-t border-gray-200 pt-5 flex items-end justify-between">
        <p className="text-xs text-gray-400 max-w-sm">
          Please retain this voucher as proof of payment. For queries, contact
          the accounts department.
        </p>
        <div className="text-right">
          <div className="border-t border-gray-400 mt-8 pt-1 w-40">
            <p className="text-xs text-gray-500">Authorised Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FullFeeVoucherTemplateProps {
  id: string;
  data: FullFeeVoucherData;
}

export function FullFeeVoucherTemplate({
  id,
  data,
}: FullFeeVoucherTemplateProps) {
  const {
    voucherId,
    totalAmount,
    installments,
    printedAt = new Date().toISOString(),
    institutionName = "Student Portal",
    studentName,
  } = data;

  return (
    <div
      id={id}
      className="bg-white text-gray-900 font-sans"
      style={{ width: "794px", minHeight: "400px", padding: "40px" }}
    >
      <div className="flex items-start justify-between border-b-2 border-blue-700 pb-5 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-700 tracking-tight">
            {institutionName}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Full Fee Voucher</p>
        </div>
        <div className="text-right">
          <span className="inline-block bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded-full tracking-widest uppercase">
            Voucher
          </span>
          <p className="text-sm text-gray-500 mt-1.5">
            #{voucherId.slice(0, 8).toUpperCase()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Print Date
          </p>
          <p className="text-sm font-semibold text-gray-800">
            {formatDate(printedAt)}
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Installments
          </p>
          <p className="text-sm font-semibold text-gray-800">
            {installments.length}
          </p>
        </div>
      </div>

      {studentName && (
        <div className="mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Student
          </p>
          <p className="text-lg font-semibold">{studentName}</p>
        </div>
      )}

      <table className="w-full text-sm border-collapse mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left px-4 py-2.5 text-gray-600 font-semibold border border-gray-200">
              Installment
            </th>
            <th className="text-left px-4 py-2.5 text-gray-600 font-semibold border border-gray-200">
              Due Date
            </th>
            <th className="text-right px-4 py-2.5 text-gray-600 font-semibold border border-gray-200">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {installments.map((installment) => (
            <tr key={installment.voucherId}>
              <td className="px-4 py-3 border border-gray-200">
                Installment #{installment.installmentNo}
              </td>
              <td className="px-4 py-3 border border-gray-200">
                {formatDate(installment.dueDate)}
              </td>
              <td className="px-4 py-3 text-right border border-gray-200 font-medium">
                {formatAmount(installment.amount)}
              </td>
            </tr>
          ))}
          <tr className="bg-gray-50 font-bold">
            <td className="px-4 py-3 border border-gray-200" colSpan={2}>
              Total Fee
            </td>
            <td className="px-4 py-3 text-right border border-gray-200 text-blue-700">
              {formatAmount(totalAmount)}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="border-t border-gray-200 pt-5 flex items-end justify-between">
        <p className="text-xs text-gray-400 max-w-sm">
          Please retain this voucher as proof of payment. For queries, contact
          the accounts department.
        </p>
        <div className="text-right">
          <div className="border-t border-gray-400 mt-8 pt-1 w-40">
            <p className="text-xs text-gray-500">Authorised Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
}
