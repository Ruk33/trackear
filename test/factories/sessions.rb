FactoryBot.define do
  factory :session do
    token { "MyString" }
    user { nil }
  end
end
