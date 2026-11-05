
import { useEffect, useState } from "react";
import Papa from "papaparse";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";

import "./App.css";

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    fetch("/allotment.csv")
      .then((res) => {
        if (!res.ok) throw new Error("Could not load CSV file");
        return res.text();
      })
      .then((csv) => {
        const result = Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          transform: (value) => value.trim(),
        });

        setData(
          result.data.map((row) => ({
            ...row,
            "SL.NO": Number(row["SL.NO"]),
            "All India Rank": Number(row["All India Rank"]),
            "Course Fees": Number(row["Course Fees"]),
          }))
        );

        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const columns = [
    { accessorKey: "SL.NO", header: "SL.NO" },
    { accessorKey: "All India Rank", header: "All India Rank" },
    { accessorKey: "Course Code", header: "Course Code" },
    {
      accessorKey: "Name of the College Allotted",
      header: "College Name",
    },
    { accessorKey: "Course Name", header: "Course Name" },
    { accessorKey: "Allotted Category", header: "Category" },
    {
      accessorKey: "Course Fees",
      header: "Course Fees",
      cell: (info) =>
        Number(info.getValue()).toLocaleString("en-IN"),
    },
    { accessorKey: "Status", header: "Status" },
  ];

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 20 },
    },
  });

  if (loading) return <h2>Loading allotment data...</h2>;
  if (error) return <h2>Error: {error}</h2>;

  return (
    <div className="container">
      <h1>College Allotment Results</h1>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Search college, rank, course..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />

        <span>Total Records: {data.length}</span>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="sortable"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}

                    {{
                      asc: " ▲",
                      desc: " ▼",
                    }[header.column.getIsSorted()] ?? " ⇅"}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell ??
                          cell.column.columnDef.accessorKey,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length}>
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </button>

        <span>
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </span>

        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </button>

        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
        >
          {[10, 20, 50, 100].map((size) => (
            <option key={size} value={size}>
              Show {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default App;
