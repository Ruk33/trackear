# frozen_string_literal: true

module InvoicesHelper
  def humanized_invoice_period(invoice)
    return unless invoice.from.present?
    invoice.from.strftime('%B %Y')
  end
end
