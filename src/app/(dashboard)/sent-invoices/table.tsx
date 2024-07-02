"use client";

import * as React from "react";
import { CaretSortIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn, formatAddress } from "@/lib/utils";
import Link from "next/link";
import { InvoiceDetails } from "@/components/invoice-details";
import { IRequestDataWithEvents } from "@requestnetwork/request-client.js/dist/types";

export type iRequest = {
  creation_date: string;
  invoice_id: string;
  amount: string;
  payment_method: string;
  due_date: string;
  payment_status: "Paid" | "Created";
  payer: string;
  recipient: string;
};

export const columns: ColumnDef<iRequest>[] = [
  {
    accessorKey: "creation_date",
    enableSorting: true,
    enableHiding: false,
    header: () => <div className="text-center">Creation Date</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("creation_date")}</div>
    ),
  },
  {
    accessorKey: "invoice_id",
    enableSorting: true,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="pl-0 bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Invoice #
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize text-left">{row.getValue("invoice_id")}</div>
    ),
  },
  {
    accessorKey: "recipient",
    enableSorting: true,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="pl-0 bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Recipient
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize text-left">
        {formatAddress(row.getValue("recipient"))}
      </div>
    ),
  },
  {
    accessorKey: "payer",
    enableSorting: true,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="pl-0 bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Client
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize text-left">
        {formatAddress(row.getValue("payer"))}
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="pl-0 bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-left">{row.getValue("amount")}</div>
    ),
  },
  {
    accessorKey: "payment_method",
    header: () => <div className="text-center">Payment Method</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium">
          {row.getValue("payment_method")}
        </div>
      );
    },
  },
  {
    accessorKey: "payment_status",
    header: () => <div className="text-center">Payment Status</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium">
          <Badge
            className={cn(
              "font-light",
              row.getValue("payment_status") === "Paid"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-black"
            )}
          >
            {row.getValue("payment_status")}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "due_date",
    header: () => <div className="text-center">Due Date</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium">
          {row.getValue("due_date")}
        </div>
      );
    },
  },
];

export function DataTable({
  data,
  requests,
}: {
  data: iRequest[];
  requests: IRequestDataWithEvents[];
}) {
  const [isRequestDetailsOpen, setIsRequestDetailsOpen] = React.useState(false);
  const [selectedRequest, setSelectedRequest] =
    React.useState<IRequestDataWithEvents | null>(null);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <InvoiceDetails
        isOpen={isRequestDetailsOpen}
        setIsOpen={setIsRequestDetailsOpen}
        request={selectedRequest!}
      />
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by client..."
          value={(table.getColumn("payer")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("payer")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Filter Display <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-[#F5f5f5]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, i) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => {
                    setSelectedRequest(requests[i]);
                    setIsRequestDetailsOpen(true);
                  }}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
