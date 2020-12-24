task :christmas_email => :environment do
  User.all.each do |user|
    UsersMailer.christmas_2020(user).deliver
  end
end
