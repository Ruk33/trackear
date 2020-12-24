class UsersMailer < ApplicationMailer

  # Subject can be set in your I18n file at config/locales/en.yml
  # with the following lookup:
  #
  #   en.users_mailer.christmas_2020.subject
  #
  def christmas_2020(user)
    mail to: user.email
  end
end
