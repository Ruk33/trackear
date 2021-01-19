# frozen_string_literal: true

class User < ApplicationRecord
  include Pay::Billable
  include Shrine::Attachment(:company_logo)

  extend FriendlyId

  friendly_id :slug_candidates, use: :slugged

  has_many :project_contracts
  has_many :project_invitations
  has_many :projects, through: :project_contracts

  has_many :activity_tracks
  has_many :activity_stop_watches

  has_many :invoices
  has_many :invoice_status

  has_many :expenses
  has_many :expense_invitations

  has_many :submissions
  has_many :other_submissions

  validates :first_name, presence: true
  validates :last_name, presence: true

  # validates_inclusion_of :time_zone, in: ActiveSupport::TimeZone.all.map(&:name)

  scope :online, -> { where("updated_at > ?", 25.minutes.ago) }

  before_create :add_30_days_trial
  before_create :track_new_user

  def can_use_premium_features?
    is_admin? || on_trial_or_subscribed?
  end

  def avatar_or_default
    picture || ''
  end

  def slug_candidates
    [%i[first_name last_name slug_suffix]]
  end

  def slug_suffix
    SecureRandom.hex(3)
  end

  def create_project_and_ensure_owner_contract(project_params)
    ActiveRecord::Base.transaction do
      project = Project.new(project_params)
      project_contracts.create!(
        activity: 'Creator',
        project: project,
        active_from: DateTime.now,
        ends_at: DateTime.now + 100.years,
        user_rate: 0,
        project_rate: 0,
        is_admin: true
      )
      project.save!
      project
    end
  end

  def currently_active_contract_for(project)
    project_contracts.currently_active.find_by(project: project)
  end

  def self.by_email_or_create(email)
    User.where(email: email).first_or_create(
      email: email,
      password: Devise.friendly_token[0, 20]
    )
  end

  def self.from_omniauth(access_token)
    data = access_token.info
    user = User.where(email: data['email']).first_or_create(
      password: Devise.friendly_token[0, 20]
    )

    user.update(
      first_name: data['first_name'],
      last_name: data['last_name'],
      picture: data['image']
    )

    user
  end

  def can_submit_feedback
    last_ten_days_feedbacks = last_ten_days_submissions | last_ten_days_other_submissions
    max_submissions_in_ten_days = 4
    last_ten_days_feedbacks.length < max_submissions_in_ten_days
  end

  def trial_days_left
    [0, (trial_ends_at - DateTime.now).to_i / 1.days].max
  end

  def next_payment_date
    return subscription.ends_at if subscription.ends_at.present?
    subscription.created_at + 30.days
  end

  private
    def days_to_seconds days
        60 * 60 * 24 * days
    end

    def last_ten_days_submissions
        self.submissions.submitted_in_period(Time.now() - days_to_seconds(10), Time.now())
    end

    def last_ten_days_other_submissions
        self.other_submissions.submitted_in_period(Time.now() - days_to_seconds(10), Time.now())
    end

    def add_30_days_trial
      self.trial_ends_at = 30.days.from_now
    end

    def track_new_user
      Analytic.new_user
    end
end
