import { DateTime } from "luxon"
import { getCsrfAsHeader } from "./CsrfToken"
import { Entry } from "./Entry"
import { Track } from "./Track"

export type InvoiceEntry = {
  id?: number,
  description: string,
  rate: string,
  from: string,
  to: string,
  track: string,
  destroyed?: boolean,
}

export type Invoice = {
  id?: number,
  project: string,
  client: string,
  entries: InvoiceEntry[],
  from: Date | null,
  to: Date | null,
}

type InvoiceShowResponse = {
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
    deleted_at: string | null,
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
 * Convert track into an invoice entry.
 * The track, refers to what user logged (their time/work)
 * The invoice entry, refers to the entry/track added to invoices.
 *
 * When a user tracks his/her time/work, a new track gets created.
 * When a administrator creates a new invoice, he/she must import
 * the tracks to create an invoice from. Each imported track gets
 * converted to an invoice entry.
 */
export function trackToInvoiceEntry(track: Track): InvoiceEntry {
  return {
    description: track.description,
    rate: track.project_rate,
    from: track.from,
    to: track.to,
    track: String(track.id)
  }
}

/**
 * Convert all tracks from entry to invoice entries using the
 * project rate as rate.
 */
export function entryToInvoiceEntries(entry: Entry): InvoiceEntry[] {
  return entry.tracks.map(trackToInvoiceEntry)
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

function invoiceToFormData(invoice: Invoice): FormData {
  const data = new FormData()

  data.append("invoice[project_id]", invoice.project)
  data.append("invoice[client_id]", invoice.client)

  if (invoice.from) {
    const isoFrom = DateTime.fromJSDate(invoice.from).toISO()
    data.append("invoice[from]", isoFrom)
  }

  if (invoice.to) {
    const isoTo = DateTime.fromJSDate(invoice.to).toISO()
    data.append("invoice[to]", isoTo)
  }

  invoice.entries.forEach((entry, i) => {
    if (entry.id) {
      data.append(`invoice[invoice_entries_attributes][${i}][id]`, String(entry.id))
    }
    data.append(`invoice[invoice_entries_attributes][${i}][description]`, entry.description)
    data.append(`invoice[invoice_entries_attributes][${i}][rate]`, entry.rate)
    data.append(`invoice[invoice_entries_attributes][${i}][from]`, entry.from)
    data.append(`invoice[invoice_entries_attributes][${i}][to]`, entry.to)
    data.append(`invoice[invoice_entries_attributes][${i}][activity_track_id]`, entry.track)
    data.append(`invoice[invoice_entries_attributes][${i}][_destroy]`, entry.destroyed ? "1" : "0")
  })

  return data
}

export async function notifyClient(project: string, invoice: string): Promise<any> {
  const response = await fetch(`/projects/${project}/invoices/${invoice}/email_notify.json`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      ...getCsrfAsHeader()
    },
  })

  return response.json()
}

export async function makeInvoiceVisible(id: number): Promise<InvoiceShowResponse> {
  const response = await fetch(`/invoices/${id}/make_visible.json`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      ...getCsrfAsHeader()
    },
  })

  return response.json()
}

export async function updateInvoice(invoice: Invoice): Promise<InvoiceShowResponse> {
  const data = invoiceToFormData(invoice)

  const response = await fetch(`/invoices/${invoice.id}.json`, {
    method: "PUT",
    headers: {
      "Accept": "application/json",
      ...getCsrfAsHeader()
    },
    body: data,
  })

  return response.json()
}

export async function createInvoice(invoice: Invoice): Promise<InvoiceShowResponse> {
  const data = invoiceToFormData(invoice)

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

export function hoursAndMinutesFromEntry(entry: InvoiceEntry) {
  return DateTime
  .fromISO(entry.to)
  .diff(DateTime.fromISO(entry.from), ["hours", "minutes"])
  .toObject()
}

/**
 * Calculate hours and minutes from entry and
 * return a string with a format HH:MM
 */
 export function formatQtyEntry(entry: InvoiceEntry): string {
  const diff = hoursAndMinutesFromEntry(entry)
  const safeHours = Number(diff.hours) || 0
  const safeMinutes = Number(diff.minutes) || 0
  const hours = safeHours < 10 ? `0${safeHours}` : `${safeHours}`
  const ceilMinutes = Math.ceil(safeMinutes)
  const minutes = ceilMinutes < 10 ? `0${ceilMinutes}` : `${ceilMinutes}`

  return `${hours}:${minutes}`
}

/**
 * Updates hours and minutes from entry.
 * This allows to easily update how much time is
 * logged in a track.
 */
 export function setHoursAndMinutesFromEntry(entry: InvoiceEntry, hours: number, minutes: number) {
  const newDate =
    DateTime
    .fromISO(entry.from)
    .plus({ hours: hours, minutes: minutes })
    .toISO()

  return {
    ...entry,
    to: newDate
  }
}

/**
 * Get all the hours logged from an entry.
 */
export function hoursFromEntry(entry: InvoiceEntry) {
  return DateTime
  .fromISO(entry.to)
  .diff(DateTime.fromISO(entry.from), "hours")
  .hours
}

/**
 * Calculate entry's total amount in cash.
 */
export function calculateEntryAmount(entry: InvoiceEntry) {
  if (entry.destroyed) {
    return 0
  }

  const hours = hoursFromEntry(entry)
  const rate = Number(entry.rate) || 0
  return Number((rate * hours).toFixed(2))
}

/**
 * Calculate total entries amount in cash.
 */
export function calculateTotalFromEntries(entries: InvoiceEntry[]) {
  return entries.reduce((result, entry) => {
    return result + calculateEntryAmount(entry)
  }, 0)
}

/**
 * Merge all tracks from a user (contained in entry) to
 * a list of invoice entries. This won't allow duplicated
 * tracks.
 */
export function mergeUserEntryToInvoiceEntries(invoiceEntries: InvoiceEntry[], entry: Entry) {
  const noRepeatedTracks = entry.tracks.filter((track) => {
    return !invoiceEntries.find((invoiceEntry) => invoiceEntry.track === String(track.id))
  })

  return [
    ...invoiceEntries,
    ...noRepeatedTracks.map(trackToInvoiceEntry),
  ]
}

/**
 * Merge all the tracks inside all the entries
 * to invoiceEntries.
 */
export function mergeEntriesToInvoiceEntries(invoiceEntries: InvoiceEntry[], entries: Entry[]) {
  return entries.reduce((result: InvoiceEntry[], entry: Entry) => {
    return mergeUserEntryToInvoiceEntries(result, entry)
  }, [...invoiceEntries])
}

/**
 * Convert entries returned by service after creating/updating
 * an invoice to InvoiceEntry[].
 */
export function entriesFromInvoiceResponse(invoice: InvoiceShowResponse): InvoiceEntry[] {
  return invoice.entries.map((createdEntry) => ({
    id: createdEntry.id,
    description: createdEntry.description,
    rate: createdEntry.rate,
    from: createdEntry.from,
    to: createdEntry.to,
    track: String(createdEntry.activity_track_id),
    destroyed: !!createdEntry.deleted_at,
  }))
}
