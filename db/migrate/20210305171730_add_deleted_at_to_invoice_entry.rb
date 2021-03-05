class AddDeletedAtToInvoiceEntry < ActiveRecord::Migration[6.0]
  def change
    add_column :invoice_entries, :deleted_at, :datetime
    add_index :invoice_entries, :deleted_at
  end
end
