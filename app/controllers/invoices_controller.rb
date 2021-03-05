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

  def show
    @invoice = current_user.invoices.first
    respond_to do |format|
      format.html { render :show }
      format.json { render :show }
    end
  end

  def create
    @invoice = current_user.invoices.for_client.new(invoice_params)

    respond_to do |format|
      if @invoice.save
        format.html { redirect_to [@invoice.project, @invoice], notice: "Factura creada exitosamente" }
        format.json { render :show, status: :created, location: @invoice }
      else
        @projects = current_user.projects
        @clients = current_user.clients
        format.html { render :new }
        format.json { render json: @invoice.errors, status: :unprocessable_entity }
      end
    end
  end

  private

  def invoice_params
    params.require(:invoice).permit(
      :project_id,
      :client_id,
      :from,
      :to,
      invoice_entries_attributes: [:id, :description, :rate, :from, :to, :activity_track_id, :_destroy],
    )
  end
end
