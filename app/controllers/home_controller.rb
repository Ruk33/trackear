# frozen_string_literal: true

class HomeController < ApplicationController
  before_action :authenticate_user!, only: [:settings, :subscription]

  def index
    if user_signed_in?
      @invitations = ProjectInvitation.where(email: current_user.email).pending.includes(:project)
      @active_contracts = current_user.project_contracts.currently_active.includes(:project)
      @contracts = current_user.project_contracts.order(active_from: :desc).includes(:project)
      @invoices = current_user.invoices.includes(:project).order(from: :desc).limit(4)
      Analytic.page_view("auth/index")
    else
      Analytic.page_view("guest/index")
    end
  end

  def solutions
    Analytic.page_view("guest/solutions")
  end

  def settings
    Analytic.page_view("auth/settings")
  end

  def subscription
    Analytic.page_view("auth/subscription")
  end

  def cancel_subscription
    Analytic.page_view("auth/cancel_subscription")
    current_user.subscription.cancel_now!
    redirect_to subscription_url, notice: t(:subscription_cancelled)
  end
end
