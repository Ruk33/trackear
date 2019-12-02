# frozen_string_literal: true

class InvoicesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_project
  before_action :set_invoice, only: %i[show edit update destroy make_visible hide]
  load_and_authorize_resource

  # GET /invoices
  # GET /invoices.json
  def index
    @invoices = if current_user.is_admin?
                  @project.invoices
                else
                  @project.invoices.visible
                end
  end

  # GET /invoices/1
  # GET /invoices/1.json
  def show; end

  # GET /invoices/new
  def new
    @invoice = Invoice.new
    @invoice.discount_percentage = 0
    @invoice.from = Date.today.beginning_of_month
    @invoice.to = Date.today.end_of_month
  end

  # GET /invoices/1/edit
  def edit; end

  # POST /invoices
  # POST /invoices.json
  def create
    @invoice = @project.invoices.new(invoice_params)

    respond_to do |format|
      if @invoice.save
        format.html { redirect_to edit_project_invoice_path(@project, @invoice), notice: 'Invoice was successfully created.' }
        format.json { render :show, status: :created, location: @invoice }
      else
        format.html { render :new }
        format.json { render json: @invoice.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /invoices/1
  # PATCH/PUT /invoices/1.json
  def update
    respond_to do |format|
      if @invoice.update(update_invoice_params)
        format.html { redirect_to project_invoice_path(@project, @invoice), notice: 'Invoice was successfully updated.' }
        format.json { render :show, status: :ok, location: @invoice }
      else
        format.html { render :edit }
        format.json { render json: @invoice.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /invoices/1
  # DELETE /invoices/1.json
  def destroy
    @invoice.destroy
    respond_to do |format|
      format.html { redirect_to invoices_url, notice: 'Invoice was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  def make_visible
    @invoice.is_visible = true
    @invoice.save

    respond_to do |format|
      format.html { redirect_to project_invoice_path(@project, @invoice), notice: 'Invoice is visible.' }
      format.json { render :show, status: :ok, location: project_invoice_path(@project, @invoice) }
    end
  end

  def hide
    @invoice.is_visible = false
    @invoice.save

    respond_to do |format|
      format.html { redirect_to project_invoice_path(@project, @invoice), notice: 'Invoice is no longer visible.' }
      format.json { render :show, status: :ok, location: project_invoice_path(@project, @invoice) }
    end
  end

  private

  def set_project
    @project = current_user.projects.friendly.find(params[:project_id])
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_invoice
    if current_user.is_admin?
      @invoice = Invoice.includes(
        invoice_entries: [
          {
            activity_track: [
              {
                project_contract: [:user]
              }
            ]
          }
        ]
      ).find(params[:id])
    else
      @invoice = @project.invoices.includes(
        invoice_entries: [
          {
            activity_track: [
              {
                project_contract: [:user]
              }
            ]
          }
        ]
      ).visible.find(params[:id])
    end
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def invoice_params
    params.require(:invoice).permit(
      :currency,
      :discount_percentage,
      :from,
      :to
    )
  end

  def update_invoice_params
    params.require(:invoice).permit(
      :discount_percentage,
      invoice_entries_attributes: %i[id description rate from to]
    )
  end
end
