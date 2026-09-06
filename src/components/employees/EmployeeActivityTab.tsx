"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/table/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useAdminMerchants, useAdminCustomers } from "@/hooks/useAdminEntities";
import type { DerivedEmployee, Payment } from "@/data/admin";
import { getPaymentsByMerchant } from "@/data/admin";
import { paymentStatusTone } from "@/data/admin/statusTones";
import { formatCompactInr, formatDate, humanizeSnakeCase } from "@/lib/format";

export function EmployeeActivityTab({ employee }: { employee: DerivedEmployee }) {
  const allMerchants = useAdminMerchants();
  const allCustomers = useAdminCustomers();

  const assignedMerchants = useMemo(
    () => allMerchants.filter((merchant) => merchant.assignedEmployeeName === employee.name),
    [allMerchants, employee.name],
  );

  const customerNameById = useMemo(
    () => new Map(allCustomers.map((customer) => [customer.id, customer.name])),
    [allCustomers],
  );
  const merchantNameById = useMemo(
    () => new Map(assignedMerchants.map((merchant) => [merchant.id, merchant.businessName])),
    [assignedMerchants],
  );

  const activity = useMemo(() => {
    const payments = assignedMerchants.flatMap((merchant) => getPaymentsByMerchant(merchant.id));
    return [...payments].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [assignedMerchants]);

  const columns = useMemo<ColumnDef<Payment>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => <span className="text-text-secondary">{formatDate(row.original.date)}</span>,
      },
      {
        id: "customer",
        header: "Customer",
        cell: ({ row }) => customerNameById.get(row.original.customerId) ?? "—",
      },
      {
        id: "merchant",
        header: "Merchant",
        cell: ({ row }) => (
          <span className="text-text-secondary">{merchantNameById.get(row.original.merchantId) ?? "—"}</span>
        ),
      },
      { accessorKey: "planId", header: "Plan" },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => <span className="tabular-nums">{formatCompactInr(row.original.amount)}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge tone={paymentStatusTone[row.original.status]}>
            {humanizeSnakeCase(row.original.status)}
          </StatusBadge>
        ),
      },
    ],
    [customerNameById, merchantNameById],
  );

  return (
    <DataTable
      columns={columns}
      data={activity}
      enablePagination
      pageSize={10}
      stickyHeader
      emptyState={<span className="text-[13px] text-text-muted">No activity yet.</span>}
    />
  );
}
