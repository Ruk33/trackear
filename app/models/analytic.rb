class Analytic < ApplicationRecord
  scope :in_range, ->(from, to) { where(created_at: from..to) }
  scope :from_months, ->(how_many) { in_range((Date.current - how_many.months).beginning_of_month, Date.current.end_of_month) }
  scope :previous_month, -> { in_range((Date.current - 1.months).beginning_of_month, (Date.current - 1.months).end_of_month) }
  scope :current_month, -> { in_range(Date.current.beginning_of_month, Date.current.end_of_month) }
  scope :page_viewed, -> { where(event: "page_view") }
  scope :new_users, -> { where(event: "new_user") }
  scope :feature_popularity, ->(feature) { page_viewed.where("value ILIKE ?", "#{feature}%") }
  scope :active_users, -> { select("distinct(value)").where(event: "user_activity").where.not(value: "guest") }
  scope :active_guests, -> { where(event: "user_activity").where(value: "guest") }
  scope :group_by_day, -> { group("DATE(created_at)") }
  scope :group_by_months, -> { group("date_trunc('month', created_at)::date") }

  def self.retention_rate_by_months(how_many)
    month_start = (Date.current - (how_many - 1).months).beginning_of_month
    month_end = Date.current.end_of_month
    retention_rate = {}

    while month_start < month_end
      total_users = User.where("created_at < ?", month_start).count
      active_users = Analytic.active_users.in_range(month_start, month_start.end_of_month).count
      retention_rate[month_start] = active_users / total_users rescue 0
      month_start += 1.month
    end

    retention_rate
  end

  def self.user_activity(user_id, browser, device, platform, ip, city, country)
    self.create(
      event: "user_activity",
      value: user_id,
      browser: browser,
      device: device,
      platform: platform,
      ip: ip,
      city: city,
      country: country
    )
  end

  def self.page_view(page, browser, device, platform, ip, city, country)
    self.create(
      event: "page_view",
      value: page,
      browser: browser,
      device: device,
      platform: platform,
      ip: ip,
      city: city,
      country: country
    )
  end

  def self.new_user
    self.create(event: "new_user")
  end
end
