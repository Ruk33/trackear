# frozen_string_literal: true

class Projects::InvoiceStatusesController < ApplicationController
  before_action :authenticate_user!

  before_action :set_project

  before_action :set_invoice_status

  before_action :project_pay_wall, only: [
    :confirm_hours
  ]

  def confirm_hours
    @invoice_status.confirm_team_member_hours

    respond_to do |format|
      format.html do
        redirect_to(
          status_project_invoice_url(@project, @invoice_status.invoice),
          notice: t(:invoice_status_thank_you_for_confirmation)
        )
      end
    end
  end

  private

  def set_project
    @project = current_user.projects.friendly.find(params[:project_id])
  end

  def set_invoice_status
    @invoice_status = current_user.invoice_status.find(params[:id])
  end
end
