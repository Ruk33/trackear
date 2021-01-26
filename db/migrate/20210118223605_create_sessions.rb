class CreateSessions < ActiveRecord::Migration[6.0]
  def change
    return if table_exists? :sessions

    create_table :sessions do |t|
      t.string :token
      t.references :user, null: false, foreign_key: true
      t.boolean :used, default: false

      t.timestamps
    end
  end
end
