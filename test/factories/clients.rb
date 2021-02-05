FactoryBot.define do
  factory :client do
    first_name { "MyString" }
    last_name { "MyString" }
    email { "MyString" }
    address { "MyString" }
    user { nil }
  end
end
