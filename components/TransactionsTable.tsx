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
    <div>
      <Table>
        <TableHeader className="bg-gray-100">
          <TableRow>
            <TableHead className="px-2">Transaction</TableHead>
            <TableHead className="px-2">Amount</TableHead>
            <TableHead className="px-2">Status</TableHead>
            <TableHead className="px-2">Date</TableHead>
            <TableHead className="px-2 max-md:hidden">Channel</TableHead>
            <TableHead className="px-2 max-md:hidden">Category</TableHead>
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
                  "!over:bg-none": true,
                  "!border-b-DEFAULT": true,
                })}
              >
                <TableCell className="max-w-[250px] pl-2 pr-10">
                  <div className="flex items-center gap-3">
                    <h1
                      className="text-14 truncate font-semibold text-gray-700"
                      title={t.name}
                    >
                      {removeSpecialCharacters(t.name) || "Unknown"}
                    </h1>
                  </div>
                </TableCell>
                <TableCell
                  className={cn("pl-2 pr-10 font-semibold", {
                    "text-red-600": isDebit || amount[0] === "-",
                    "text-green-600": !isDebit && amount[0] !== "-",
                  })}
                >
                  {isDebit ? `-${amount}` : isCredit ? amount : amount}
                </TableCell>
                <TableCell className="pl-2 pr-10">
                  <CategoryBadge category={status} />
                </TableCell>
                <TableCell className="min-w-32 pl-2 pr-10">
                  {formatDateTime(new Date(t.date)).dateTime}
                </TableCell>
                <TableCell className="pl-2 pr-10 capitalize min-w-24">
                  {t.paymentChannel || "N/A"}
                </TableCell>
                <TableCell className="pl-2 pr-10 max-md:hidden">
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
