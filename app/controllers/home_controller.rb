# frozen_string_literal: true

class HomeController < ApplicationController
  before_action :authenticate_user!, only: [:settings, :company_settings, :subscription]

  def index
    if user_signed_in?
      @stopwatch = current_user.activity_stop_watches.running.first
      @tracks = get_tracks
      @invitations = ProjectInvitation.where(email: current_user.email).pending.includes(:project)
      @active_contracts = current_user.project_contracts.currently_active.includes(:project)
      track_page_view("auth/index")
    else
      track_page_view("guest/index")
    end
  end

  def solutions
    track_page_view("guest/solutions")
  end

  def settings
    track_page_view("auth/settings")
  end

  def company_settings
    track_page_view("auth/company_settings")
  end

  def subscription
    track_page_view("auth/subscription")
  end

  def cancel_subscription
    track_page_view("auth/cancel_subscription")
    current_user.subscription.cancel_now!
    redirect_to subscription_url, notice: t(:subscription_cancelled)
  end

  private

  def get_tracks
    from = params[:from];
    to = params[:to];
    user = params[:user_id]
    project = params[:project_id]

    from = nil if from.nil? or from.empty?
    to = nil if to.nil? or to.empty?

    from = from.to_date if from
    to = to.to_date if to

    if user.nil? or user.empty?
      user = [current_user.id]
    else
      user = [user]
    end

    if project.nil? or project.empty?
      project = []
    else
      project = [project]
    end

    ActivityTrackService.all_from(project, user, from, to).order(created_at: :desc)
  end
end
