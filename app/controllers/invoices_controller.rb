# frozen_string_literal: true

class InvoicesController < ApplicationController
  before_action :authenticate_user!

  def index
    @invoices = current_user.invoices
  end

  def new
    @invoice = current_user.invoices.new
    @projects = current_user.projects
    @clients = current_user.clients
  end

  def create
    @invoice = current_user.invoices.for_client.new(invoice_params)

    if @invoice.save
      redirect_to [@invoice.project, @invoice], notice: "Factura creada exitosamente"
    else
      @projects = current_user.projects
      @clients = current_user.clients
      render :new
    end
  end

  private

  def invoice_params
    params.require(:invoice).permit(
      :project_id,
      :client_id,
      :from,
      :to,
    )
  end
end
