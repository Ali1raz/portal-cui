"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SITE_INFO } from "@/lib/data/SITE";
import { formatFeeAmount, formatFeeDate } from "@/lib/utils/fee-format";
import {
  FeeStudentInfo,
  FullFeeVoucherData,
} from "@/app/data/student/st-get-fee";

interface FeeVoucherTemplateProps {
  id: string;
  data: VoucherData;
}

export interface VoucherData {
  voucherId: string;
  installmentNo: number;
  amount: number;
  dueDate: string;
  printedAt?: string;
  institutionName?: string;
  student?: FeeStudentInfo;
}

interface FullFeeVoucherTemplateProps {
  id: string;
  data: FullFeeVoucherData;
}

type ChallanCopyType = "Bank Copy" | "Campus Copy" | "Student Copy";

function formatAmount(amount: number): string {
  return formatFeeAmount(amount);
}

function formatDate(date: string): string {
  return formatFeeDate(date, "long");
}

function VoucherLayout({
  id,
  heading,
  copies,
  institutionName,
}: {
  id: string;
  heading: string;
  copies: React.ReactNode;
  institutionName: string;
}) {
  return (
    <div
      id={id}
      className="bg-[#f0ece4] text-gray-900"
      style={{ width: "1300px", minHeight: "560px", padding: "20px" }}
    >
      <style>{`
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .voucher-sans { font-family: 'IBM Plex Sans', sans-serif; }
      `}</style>

      <p className="font-mono text-xs text-gray-600 mb-3 tracking-widest uppercase">
        {heading}
      </p>

      <div className="grid grid-cols-3 gap-4 items-start">{copies}</div>

      <p className="font-mono text-xs text-gray-500 mt-3 text-center tracking-wide">
        {institutionName}
      </p>
    </div>
  );
}

function ChallanCopyCard({
  copyType,
  institutionName,
  voucherId,
  issueDate,
  student,
  metaRow,
  feeRows,
  totalLabel,
  totalAmount,
}: {
  copyType: ChallanCopyType;
  institutionName: string;
  voucherId: string;
  issueDate?: string;
  student?: FeeStudentInfo;
  metaRow: React.ReactNode;
  feeRows: React.ReactNode;
  totalLabel: string;
  totalAmount: number;
}) {
  return (
    <div className="bg-white border-2 border-black shadow-[4px_4px_0_#1a1a1a] overflow-hidden voucher-sans">
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <p className="font-mono font-bold text-sm tracking-tight leading-none">
            {institutionName}
          </p>
          <p className="text-muted-foreground font-mono text-xs mt-1">
            Fee Payment Challan
          </p>
        </div>
        <span className="bg-white text-black font-mono text-[10px] font-bold px-2 py-1">
          {copyType}
        </span>
      </div>

      <Table>
        <TableBody>
          <TableRow>
            <TableCell className="px-2 py-1.5 bg-gray-50 w-2/5 font-mono text-[10px] text-gray-600 uppercase font-semibold">
              Challan #
            </TableCell>
            <TableCell className="px-2 py-1.5 font-mono text-[11px] font-bold">
              {voucherId.slice(0, 8).toUpperCase()}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="px-2 py-1.5 bg-gray-50 font-mono text-[10px] text-gray-600 uppercase font-semibold">
              Issue Date
            </TableCell>
            <TableCell className="px-2 py-1.5 font-mono text-[11px]">
              {formatDate(issueDate ?? "")}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="px-2 py-1.5 bg-gray-50 font-mono text-[10px] text-gray-600 uppercase font-semibold">
              Reg. No
            </TableCell>
            <TableCell className="px-2 py-1.5 font-mono text-[11px] font-semibold">
              {student?.registrationNo || "N/A"}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="px-2 py-1.5 bg-gray-50 font-mono text-[10px] text-gray-600 uppercase font-semibold">
              Name
            </TableCell>
            <TableCell className="px-2 py-1.5">
              <span className="font-mono text-[11px] font-semibold">
                {student?.name || "N/A"}
              </span>
            </TableCell>
          </TableRow>
          {metaRow}
        </TableBody>
      </Table>

      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="px-2 py-1.5 text-left font-mono text-[10px] uppercase font-semibold">
              Description
            </TableHead>
            <TableHead className="px-2 py-1.5 text-right font-mono text-[10px] uppercase font-semibold">
              Amount (Rs.)
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {feeRows}
          <TableRow>
            <TableCell className="p-2 font-mono text-[10px] uppercase font-bold">
              {totalLabel}
            </TableCell>
            <TableCell className="p-2 text-right font-mono text-xs font-bold">
              {formatAmount(totalAmount)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div className="px-3 py-2 border-t-2 border-black bg-gray-50">
        <p className="text-[10px] text-gray-600 leading-relaxed font-mono">
          1. Registration will be completed after payment clearance.
          <br />
          2. Keep this challan for verification.
        </p>
      </div>

      <div className="border-t-2 border-black px-3 min-h-20">
        <span className="text-lg font-semibold text-gray-700">Bank Stamp</span>
      </div>
    </div>
  );
}

export function FeeVoucherTemplate({ id, data }: FeeVoucherTemplateProps) {
  const {
    voucherId,
    installmentNo,
    amount,
    dueDate,
    printedAt,
    institutionName = SITE_INFO.institution_name,
    student,
  } = data;

  return (
    <VoucherLayout
      id={id}
      heading="Fee Payment Challan · Installment Voucher"
      institutionName={institutionName}
      copies={(
        ["Bank Copy", "Campus Copy", "Student Copy"] as ChallanCopyType[]
      ).map((copy) => (
        <ChallanCopyCard
          key={copy}
          copyType={copy}
          institutionName={institutionName}
          voucherId={voucherId}
          issueDate={printedAt}
          student={student}
          metaRow={
            <>
              <TableRow>
                <TableCell className="px-2 py-1.5 bg-gray-50 font-mono text-[10px] text-gray-600 uppercase font-semibold">
                  Installment
                </TableCell>
                <TableCell className="px-2 py-1.5 font-mono text-[11px] font-semibold">
                  {installmentNo}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="px-2 py-1.5 bg-gray-50 font-mono text-[10px] text-gray-600 uppercase font-semibold">
                  Due Date
                </TableCell>
                <TableCell className="px-2 py-1.5 font-mono text-[11px] font-semibold">
                  {formatDate(dueDate)}
                </TableCell>
              </TableRow>
            </>
          }
          feeRows={
            <TableRow>
              <TableCell className="p-2 text-[11px]">
                Fee Installment #{installmentNo}
              </TableCell>
              <TableCell className="p-2 text-right font-mono text-[11px] font-semibold">
                {formatAmount(amount)}
              </TableCell>
            </TableRow>
          }
          totalLabel={`Total Fee upto ${formatDate(dueDate)}`}
          totalAmount={amount}
        />
      ))}
    />
  );
}

export function FullFeeVoucherTemplate({
  id,
  data,
}: FullFeeVoucherTemplateProps) {
  const {
    voucherId,
    totalAmount,
    installments,
    printedAt,
    institutionName = SITE_INFO.institution_name,
    student,
    semesterLabel,
  } = data;

  return (
    <VoucherLayout
      id={id}
      heading="Fee Payment Challan · Full Fee Voucher"
      institutionName={institutionName}
      copies={(
        ["Bank Copy", "Campus Copy", "Student Copy"] as ChallanCopyType[]
      ).map((copy) => (
        <ChallanCopyCard
          key={copy}
          copyType={copy}
          institutionName={institutionName}
          voucherId={voucherId}
          issueDate={printedAt}
          student={student}
          metaRow={
            <>
              <TableRow>
                <TableCell className="px-2 py-1.5 bg-gray-50 font-mono text-[10px] text-gray-600 uppercase font-semibold">
                  Program / Session
                </TableCell>
                <TableCell className="px-2 py-1.5 font-mono text-[11px] font-semibold">
                  {semesterLabel || "N/A"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="px-2 py-1.5 bg-gray-50 font-mono text-[10px] text-gray-600 uppercase font-semibold">
                  Installments
                </TableCell>
                <TableCell className="px-2 py-1.5 font-mono text-[11px] font-semibold">
                  {installments.length}
                </TableCell>
              </TableRow>
            </>
          }
          feeRows={installments.map((installment) => (
            <TableRow key={installment.voucherId}>
              <TableCell className="p-2 text-[11px]">
                Installment #{installment.installmentNo} (
                {formatDate(installment.dueDate)})
              </TableCell>
              <TableCell className="p-2 text-right font-mono text-[11px] font-semibold">
                {formatAmount(installment.amount)}
              </TableCell>
            </TableRow>
          ))}
          totalLabel={`Total Fee upto ${formatDate(printedAt ?? installments[0]?.dueDate ?? "")}`}
          totalAmount={totalAmount}
        />
      ))}
    />
  );
}
