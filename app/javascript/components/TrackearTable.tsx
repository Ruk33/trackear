import React, { memo, useMemo } from "react"

export type TableColumn = {
  id: string,
  props?: React.ComponentProps<"th">,
  component: React.ReactNode,
}

type Props = {
  columns: TableColumn[],
  className?: string,
  children: React.ReactNode,
}

function TrackearTable(props: Props) {
  const { className, columns, children } = props

  const css = useMemo(() => {
    return [
      "w-full",
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

  return (
    <table className={css}>
      <thead>
        <tr>
          {tableHeaders}
        </tr>
      </thead>
      <tbody>
        {children}
      </tbody>
    </table>
  )
}

export default memo(TrackearTable)
