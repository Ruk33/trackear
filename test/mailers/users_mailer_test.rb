require 'test_helper'

class UsersMailerTest < ActionMailer::TestCase
  test "christmas_2020" do
    mail = UsersMailer.christmas_2020
    assert_equal "Christmas 2020", mail.subject
    assert_equal ["to@example.org"], mail.to
    assert_equal ["from@example.com"], mail.from
    assert_match "Hi", mail.body.encoded
  end

end
