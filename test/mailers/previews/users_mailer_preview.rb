# Preview all emails at http://localhost:3000/rails/mailers/users_mailer
class UsersMailerPreview < ActionMailer::Preview

  # Preview this email at http://localhost:3000/rails/mailers/users_mailer/christmas_2020
  def christmas_2020
    UsersMailer.christmas_2020 User.first
  end

end
