class AddClientsToInvoices < ActiveRecord::Migration[6.0]
  def change
    add_reference :invoices, :client, null: true, foreign_key: true
  end
end
