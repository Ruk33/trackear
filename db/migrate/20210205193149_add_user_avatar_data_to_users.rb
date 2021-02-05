class AddUserAvatarDataToUsers < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :user_avatar_data, :text
  end
end
