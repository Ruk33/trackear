import React, { memo, useCallback, useMemo } from "react"
import { Client } from "components/service/Client"
import { InvoiceEntry, hoursFromEntry, calculateEntryAmount, calculateTotalFromEntries } from "components/service/Invoice"
import TrackearTable, { TableColumn } from "components/TrackearTable"

type ShowInvoiceProps = {
  entries: InvoiceEntry[],
  client: Client | undefined,
  companyLogo: string,
  companyName: string,
  companyAddress: string,
  companyEmail: string,
}

function ShowInvoice(props: ShowInvoiceProps) {
  const { entries, client, companyName, companyAddress, companyEmail, companyLogo } = props

  const columns: TableColumn[] = useMemo(() => {
    return [
      {
        id: "index",
        component: "#",
        props: { className: "w-12 text-left border-b-2 px-2" },
      },
      {
        id: "description",
        component: "Description",
        props: { className: "text-left border-b-2 px-2" },
      },
      {
        id: "qty",
        component: "Qty",
        props: { className: "w-48 text-right border-b-2 px-2" },
      },
      {
        id: "amount",
        component: "Total",
        props: { className: "w-48 text-right border-b-2 px-2" },
      },
    ]
  }, [])

  const total = useMemo(() => calculateTotalFromEntries(entries), [entries])

  const buildRows = useCallback(() => {
    const nonRemovedEntries = entries.filter((entry) => !entry.destroyed)
    return nonRemovedEntries.map((entry, index) => (
      <tr key={entry.id}>
        <td className="text-left border-b px-2">{index + 1}</td>
        <td className="text-left border-b px-2">{entry.description}</td>
        <td className="text-right border-b px-2">{hoursFromEntry(entry).toFixed(2)}</td>
        <td className="text-right border-b px-2">${calculateEntryAmount(entry)}</td>
      </tr>
    ))
  }, [entries])

  return (
    <div className="alternative-font mx-auto p-6 shadow-lg bg-white" style={{ width: "1024px" }}>
      <h1 className="text-4xl">Invoice</h1>
      <div className="my-4 p-4 bg-gray-900 text-white">
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="text-left">
            <h2 className="font-bold">Bill to</h2>
            <p>{client && `${client.first_name} ${client.last_name}`}</p>
            <p>{client && client.address}</p>
          </div>
          <div className="text-right">
            <h2 className="font-bold">{companyName}</h2>
            <p>{companyAddress}</p>
            <p>{companyEmail}</p>
          </div>
        </div>
      </div>

      <TrackearTable columns={columns}>
        {buildRows()}
        <tr>
          <td colSpan={3}></td>
          <td className="text-center text-white py-4 text-2xl px-2 bg-pink-500">Total: ${total.toFixed(2)}</td>
        </tr>
      </TrackearTable>
    </div>
  )
}

export default memo(ShowInvoice)
