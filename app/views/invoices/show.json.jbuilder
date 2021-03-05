json.invoice @invoice
json.entries @invoice.invoice_entries.with_deleted.order(from: :desc)
