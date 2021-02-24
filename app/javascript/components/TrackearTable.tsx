import React, { memo, useMemo } from "react"

export type TableColumn = {
  id: string,
  props?: any,
  component: any,
}

export type TableRow = {
  id: string,
  component: any,
  props?: any,
}

type Props = {
  columns: TableColumn[],
  rows: TableRow[][],
  className?: string,
}

function TrackearTable(props: Props) {
  const { className, columns, rows } = props

  const css = useMemo(() => {
    return [
      "w-full",
      "border",
      "table-fixed",
      ...(className || "").split(" ")
    ].join(" ")
  }, [className])

  const tableHeaders = useMemo(() => {
    return columns.map((column) => (
      <th key={column.id} {...column.props}>
        {column.component}
      </th>
    ))
  }, [columns])

  const tableRows = useMemo(() => {
    return rows.map((cells, index) => (
      <tr key={`row-${index}`}>
        {cells.map((cell) => (
          <td key={cell.id} {...cell.props}>
            {cell.component}
          </td>
        ))}
      </tr>
    ))
  }, [rows])

  return (
    <table className={css}>
      <thead className="border">
        <tr>
          {tableHeaders}
        </tr>
      </thead>
      <tbody>
        {tableRows}
      </tbody>
    </table>
  )
}

export default memo(TrackearTable)
