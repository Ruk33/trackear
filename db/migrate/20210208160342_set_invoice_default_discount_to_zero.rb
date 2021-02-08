class SetInvoiceDefaultDiscountToZero < ActiveRecord::Migration[6.0]
  def change
    change_column_default :invoices, :discount_percentage, 0
  end
end
