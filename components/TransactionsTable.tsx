import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  cn,
  formatAmount,
  formatDateTime,
  getTransactionStatus,
  removeSpecialCharacters,
} from "@/lib/utils";
import { transactionCategoryStyles } from "@/constants";

const CategoryBadge = ({ category }: CategoryBadgeProps) => {
  if (!category) return null;

  const { borderColor, backgroundColor, textColor, chipBackgroundColor } =
    transactionCategoryStyles[
      category as keyof typeof transactionCategoryStyles
    ] || transactionCategoryStyles.default;

  return (
    <div className={cn("category-badge", borderColor, chipBackgroundColor)}>
      <div className={cn("size-2 rounded-full", backgroundColor)} />
      <p className={cn("text-[12px] font-medium", textColor)}>{category}</p>
    </div>
  );
};

const TransactionsTable = ({ transactions = [] }: TransactionTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full table-auto">
        <TableHeader className="bg-gray-100">
          <TableRow>
            <TableHead className="px-2">Transaction</TableHead>
            <TableHead className="px-2">Amount</TableHead>
            <TableHead className="px-2">Status</TableHead>
            <TableHead className="px-2">Date</TableHead>
            <TableHead className="px-2 hidden md:table-cell">Channel</TableHead>
            <TableHead className="px-2 hidden md:table-cell">
              Category
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t: Transaction) => {
            const status = getTransactionStatus(new Date(t.date));
            const amount = formatAmount(t.amount);

            const isDebit = t.type === "debit";
            const isCredit = t.type === "credit";

            return (
              <TableRow
                key={t.id}
                className={cn({
                  "bg-red-50": isDebit || amount[0] === "-",
                  "bg-green-50": !isDebit && amount[0] !== "-",
                })}
              >
                <TableCell className="max-w-[250px] truncate px-2">
                  <div className="flex items-center gap-3">
                    <h1
                      className="text-[14px] font-semibold text-gray-700"
                      title={t.name}
                    >
                      {removeSpecialCharacters(t.name) || "Unknown"}
                    </h1>
                  </div>
                </TableCell>
                <TableCell
                  className={cn("px-2 font-semibold", {
                    "text-red-600": isDebit || amount[0] === "-",
                    "text-green-600": !isDebit && amount[0] !== "-",
                  })}
                >
                  {isDebit ? `-${amount}` : isCredit ? amount : amount}
                </TableCell>
                <TableCell className="px-2">
                  <CategoryBadge category={status} />
                </TableCell>
                <TableCell className="px-2">
                  {formatDateTime(new Date(t.date)).dateTime}
                </TableCell>
                <TableCell className="px-2 hidden md:table-cell capitalize">
                  {t.paymentChannel || "N/A"}
                </TableCell>
                <TableCell className="px-2 hidden md:table-cell">
                  <CategoryBadge category={t.category || "Unknown"} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionsTable;
