"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div
      className="
        overflow-hidden
        rounded-3xl
        border
        border-[#ece1e2]
        bg-white
        shadow-sm
      "
    >
      <div className="overflow-x-auto">

        <Table>

          <TableHeader className="bg-[#fcfaf9]">

            {table.getHeaderGroups().map((headerGroup) => (

              <TableRow key={headerGroup.id}>

                {headerGroup.headers.map((header) => (

                  <TableHead
                    key={header.id}
                    className="
                      h-14
                      px-6
                      font-semibold
                      text-[#87565b]
                    "
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>

                ))}

              </TableRow>

            ))}

          </TableHeader>

          <TableBody>

            {table.getRowModel().rows.length ? (

              table.getRowModel().rows.map((row) => (

                <TableRow
                  key={row.id}
                  className="
                    transition-colors
                    hover:bg-[#fcfaf9]
                  "
                >

                  {row.getVisibleCells().map((cell) => (

                    <TableCell
                      key={cell.id}
                      className="px-6 py-5"
                    >
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
                  className="
                    h-32
                    text-center
                    text-[#87565b]
                  "
                >
                  No records found.
                </TableCell>

              </TableRow>

            )}

          </TableBody>

        </Table>

      </div>
    </div>
  );
}