# frozen_string_literal: true

class InvoicesController < ApplicationController
  before_action :authenticate_user!

  def index
    @invoices = current_user.invoices
  end

  def new
    @invoice = current_user.invoices.new
    @projects = current_user.projects
  end

  def create
    @invoice = current_user.invoices.new(invoice_params)

    if @invoice.save
      redirect_to [@invoice.project, @invoice], notice: "Factura creada exitosamente"
    else
      @projects = current_user.projects
      render :new
    end
  end

  private

  def invoice_params
    params.require(:invoice).permit(
      :project_id,
      :from,
      :to,
      :discount_percentage
    )
  end
end
