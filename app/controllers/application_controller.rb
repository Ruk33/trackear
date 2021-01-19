# frozen_string_literal: true

class ApplicationController < ActionController::Base
  layout :choose_layout

  before_action :set_raven_context
  before_action :add_home_breadcrumb

  after_action :track_user_activity

  around_action :user_time_zone, if: :user_signed_in?
  around_action :switch_locale

  helper_method :current_user
  helper_method :user_signed_in?

  # Only check for active subscription
  # for the current user
  def pay_wall
    redirect_to subscription_path unless current_user.can_use_premium_features?
  end

  # Check if the project owner has an
  # active subscription
  def project_pay_wall
    owners = @project.owners
    redirect_to subscription_path unless owners.any? &:can_use_premium_features?
  end

  def track_page_view(page)
    Analytic.page_view(
      page,
      browser.name,
      browser.device.name,
      browser.platform.name,
      request.remote_ip,
      request.safe_location.city,
      request.safe_location.country,
      request.query_parameters[:utm_source],
      request.query_parameters[:utm_medium],
      request.query_parameters[:utm_campaign]
    )
  end

  private

  def current_user
    @current_user ||= User.find(session[:user_id]) if session[:user_id]
  end

  def user_signed_in?
    current_user.present?
  end

  def authenticate_user!
    redirect_to login_path unless user_signed_in?
  end

  def track_user_activity
    user_id = user_signed_in? ? current_user.id : "guest"
    Analytic.user_activity(
      user_id,
      browser.name,
      browser.device.name,
      browser.platform.name,
      request.remote_ip,
      request.safe_location.city,
      request.safe_location.country
    )
  end

  def add_home_breadcrumb
    add_breadcrumb t(:home), home_path
  end

  def switch_locale(&action)
    locale = if user_signed_in?
               current_user.locale || :es
             else
               :es
             end
    I18n.with_locale(locale, &action)
  end

  def user_time_zone(&block)
    Time.use_zone(current_user.time_zone, &block)
  end

  def choose_layout
    'application' unless user_signed_in?
    'authenticated' if user_signed_in?
  end

  def set_raven_context
    Raven.user_context(id: session[:current_user_id]) # or anything else in session
    Raven.extra_context(params: params.to_unsafe_h, url: request.url)
  end
end
