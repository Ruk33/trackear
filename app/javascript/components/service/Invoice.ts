import { getCsrfAsHeader } from "./CsrfToken"
import { Entry } from "./Entry"

export type InvoiceEntry = {
  description: string,
  rate: string,
  from: string,
  to: string,
  track: string,
}

export type Invoice = {
  project: string,
  client: string,
  entries: InvoiceEntry[],
}

type CreateInvoiceResponse = {
  invoice: {
    afip_price_cents: number,
    afip_price_currency: string,
    client_id: number,
    created_at: string,
    currency: string | null,
    deleted_at: string | null,
    discount_percentage: string,
    exchange_cents: number,
    exchange_currency: string,
    from: string | null,
    id: number,
    invoice_data: null,
    is_client_visible: boolean,
    is_visible: boolean | null,
    payment_data: null,
    project_id: number,
    to: string | null,
    updated_at: string,
    user_id: number,
  },
  entries: {
    activity_track_id: number,
    created_at: string,
    description: string,
    from: string,
    id: number,
    invoice_id: number,
    rate: string,
    to: string,
    updated_at: string,
  }[]
}

/**
 * Convert all tracks from entry to invoice entries using the
 * project rate as rate.
 */
export function entryToInvoiceEntries(entry: Entry): InvoiceEntry[] {
  return entry.tracks.map((track) => ({
    description: track.description,
    rate: track.project_rate,
    from: track.from,
    to: track.to,
    track: String(track.id)
  }))
}

/**
 * Convert all tracks from entries to invoice entries using the
 * project rate as rate.
 */
export function entriesToInvoiceEntries(entries: Entry[]): InvoiceEntry[] {
  return entries.reduce((result: InvoiceEntry[], entry: Entry) => {
    return [
      ...result,
      ...entryToInvoiceEntries(entry),
    ]
  }, [])
}

export async function createInvoice(invoice: Invoice): Promise<CreateInvoiceResponse> {
  const data = new FormData()

  data.append("invoice[project_id]", invoice.project)
  data.append("invoice[client_id]", invoice.client)

  invoice.entries.forEach((entry, i) => {
    data.append(`invoice[invoice_entries_attributes][${i}][description]`, entry.description)
    data.append(`invoice[invoice_entries_attributes][${i}][rate]`, entry.rate)
    data.append(`invoice[invoice_entries_attributes][${i}][from]`, entry.from)
    data.append(`invoice[invoice_entries_attributes][${i}][to]`, entry.to)
    data.append(`invoice[invoice_entries_attributes][${i}][activity_track_id]`, entry.track)
  })

  const response = await fetch("/invoices.json", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      ...getCsrfAsHeader()
    },
    body: data,
  })

  return response.json()
}
