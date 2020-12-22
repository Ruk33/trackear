class AddExtraFieldsToAnalytics < ActiveRecord::Migration[6.0]
  def change
    add_column :analytics, :browser, :string
    add_column :analytics, :device, :string
    add_column :analytics, :ip, :string
    add_column :analytics, :platform, :string
    add_column :analytics, :city, :string
    add_column :analytics, :country, :string
  end
end
