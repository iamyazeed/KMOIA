import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * Generic admin table.
 *
 * Server-rendered and typed over the row shape, so every list screen in later
 * phases looks and behaves identically without repeating markup. Wide tables
 * scroll inside their own container — the page never scrolls sideways.
 */

export type Column<Row> = {
  key: string;
  header: ReactNode;
  cell: (row: Row) => ReactNode;
  /** Hidden below `sm`. Use for secondary detail on narrow screens. */
  hideOnMobile?: boolean;
  align?: "left" | "right";
  width?: string;
};

export function DataTable<Row extends { id: string }>({
  rows,
  columns,
  empty,
  caption,
}: {
  rows: Row[];
  columns: Column<Row>[];
  empty: ReactNode;
  caption?: string;
}) {
  if (rows.length === 0) {
    return <>{empty}</>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface">
      <table className="w-full min-w-[36rem] border-collapse text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="border-b border-line">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                style={column.width ? { width: column.width } : undefined}
                className={cn(
                  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted",
                  column.align === "right" && "text-right",
                  column.hideOnMobile && "hidden sm:table-cell",
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-line last:border-0 hover:bg-subtle/60"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    "px-4 py-3 align-middle",
                    column.align === "right" && "text-right",
                    column.hideOnMobile && "hidden sm:table-cell",
                  )}
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
