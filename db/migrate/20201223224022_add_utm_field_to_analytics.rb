class AddUtmFieldToAnalytics < ActiveRecord::Migration[6.0]
  def change
    add_column :analytics, :utm_source, :string
    add_column :analytics, :utm_campaign, :string
    add_column :analytics, :utm_medium, :string
  end
end
