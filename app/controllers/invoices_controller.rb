# frozen_string_literal: true

class InvoicesController < ApplicationController
  before_action :authenticate_user!

  before_action :set_project

  before_action :set_invoice, except: %i[index new create]

  before_action :project_pay_wall, only: [
    :new,
    :create,
    :update,
    :add_entries_to_client_invoice,
    :email_notify,
    :make_internal,
    :make_client,
    :make_visible,
    :hide,
    :review_entries,
    :upload_invoice,
    :upload_payment
  ]

  authorize_resource

  def index
    Analytic.page_view("auth/invoices")

    @filter = params.dig(:type)
    @invoices = InvoiceService.invoices_from(current_user, @project).includes([:invoice_entries, :invoice_status])

    if (@filter == "paid")
      @invoices = @invoices.select(&:is_paid?)
    elsif (@filter == "unpaid")
      @invoices = @invoices.select(&:is_unpaid?)
    end

    add_breadcrumb @project.name, @project
    add_breadcrumb t :invoices
  end

  def show
    Analytic.page_view("auth/invoices/show")

    add_breadcrumb @project.name, @project
    add_breadcrumb t(:invoices), project_invoices_path(@project)
    add_breadcrumb @invoice.from.strftime('%B %Y')

    respond_to do |format|
      format.html
      format.json
      format.pdf { send_data(
        ClientInvoicePdfService.build(@invoice).render,
        filename: "#{@invoice.from.strftime('%B %Y')}.pdf",
        type: "application/pdf",
        disposition: :inline
      )}
    end
  end

  def new
    Analytic.page_view("auth/invoices/new")

    @invoice = current_user.invoices.new(
      project: @project,
      discount_percentage: 0,
      from: Date.today.beginning_of_month,
      to: Date.today.end_of_month
    )
    add_breadcrumb @project.name, @project
    add_breadcrumb t(:invoices), project_invoices_path(@project)
    add_breadcrumb t :create_invoice
  end

  def edit
    Analytic.page_view("auth/invoices/edit")
  end

  def create
    Analytic.page_view("auth/invoices/create")

    params_with_project_and_discount = invoice_params.merge(
      project: @project,
      discount_percentage: 0
    )
    @invoice = current_user.invoices.new_client_invoice(
      params_with_project_and_discount
    )

    respond_to do |format|
      if @invoice.save
        format.html { redirect_to status_project_invoice_url(@project, @invoice), notice: t(:invoice_successfully_created) }
        format.json { render json: status_project_invoice_url(@project, @invoice), status: :created }
      else
        format.html { render :new }
        format.json { render json: @invoice.errors, status: :unprocessable_entity }
      end
    end
  end

  def update
    Analytic.page_view("auth/invoices/update")

    respond_to do |format|
      if @invoice.update(update_invoice_params)
        format.html { redirect_to project_invoice_path(@project, @invoice), notice: t(:invoice_successfully_updated) }
        format.json { render :show, status: :ok, location: @invoice }
      else
        format.html { render :edit }
        format.json { render json: @invoice.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    Analytic.page_view("auth/invoices/destroy")

    @invoice.destroy
    respond_to do |format|
      format.html { redirect_to project_invoices_url(@project), notice: t(:invoice_successfully_destroyed) }
      format.json { head :no_content }
    end
  end

  def add_entries_to_client_invoice
    @invoice.add_entries_to_client_invoice
    respond_to do |format|
      format.html { redirect_to status_project_invoice_url(@project, @invoice), notice: t(:invoice_add_entries_successfully) }
      format.json { render :show, status: :ok, location: status_project_invoice_url(@project, @invoice) }
    end
  end

  def email_notify
    @invoice.notify_client

    if @invoice.project.client_email.present?
      InvoiceMailer.invoice_notify(@invoice).deliver_later
    end

    respond_to do |format|
      format.html { redirect_to status_project_invoice_url(@project, @invoice), notice: 'Email notification sent.' }
      format.json { render :show, status: :ok, location: status_project_invoice_url(@project, @invoice) }
    end
  end

  def make_internal
    @invoice.is_client_visible = false
    @invoice.save

    respond_to do |format|
      format.html { redirect_to project_invoice_path(@project, @invoice), notice: 'Invoice is now internal.' }
      format.json { render :show, status: :ok, location: project_invoice_path(@project, @invoice) }
    end
  end

  def make_client
    @invoice.is_client_visible = true
    @invoice.save

    respond_to do |format|
      format.html { redirect_to project_invoice_path(@project, @invoice), notice: 'Invoice is now a client invoice.' }
      format.json { render :show, status: :ok, location: project_invoice_path(@project, @invoice) }
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

  def download_invoice
    Analytic.page_view("auth/invoices/download_invoice")

    name = @invoice.project.name + ' - ' + @invoice.from.strftime('%B %Y')
    send_data @invoice.invoice.download.read, filename: name + '.pdf', type: 'application/pdf'
  end

  def download_payment
    Analytic.page_view("auth/invoices/download_payment")

    name = @invoice.project.name + ' - Payment - ' + @invoice.from.strftime('%B %Y')
    send_data @invoice.payment.download.read, filename: name + '.pdf', type: 'application/pdf'
  end

  def review_entries
    Analytic.page_view("auth/invoices/review_entries")

    add_breadcrumb @project.name, @project
    add_breadcrumb t(:invoices), project_invoices_path(@project)
    add_breadcrumb @invoice.from.strftime('%B %Y'), [@project, @invoice]
    add_breadcrumb t(:review_invoice)
  end

  def upload_invoice
    Analytic.page_view("auth/invoices/upload_invoice")

    respond_to do |format|
      if @invoice.add_invoice(upload_invoice_params)
        format.html { redirect_to status_project_invoice_path(@project, @invoice), notice: t(:invoice_attached_successfully) }
        format.json { render :show, status: :ok, location: status_project_invoice_path(@project, @invoice) }
      else
        format.html { render :edit }
        format.json { render json: @invoice.errors, status: :unprocessable_entity }
      end
    end
  end

  def upload_payment
    Analytic.page_view("auth/invoices/upload_payment")

    respond_to do |format|
      if @invoice.add_payment(upload_payment_params)
        format.html { redirect_to status_project_invoice_url(@project, @invoice), notice: t(:invoice_payment_attached_successfully) }
        format.json { render :show, status: :ok, location: @invoice }
      else
        format.html { render :edit }
        format.json { render json: @invoice.errors, status: :unprocessable_entity }
      end
    end
  end

  def status
    Analytic.page_view("auth/invoices/status")

    @invoice_status = @invoice.invoice_status
    @invoice_status.update_last_checked
    add_breadcrumb @project.name, @project
    add_breadcrumb t(:invoices), project_invoices_path(@project)
    add_breadcrumb @invoice.from.strftime('%B %Y')
  end

  private

  def set_project
    @project = current_user.projects.friendly.find(params[:project_id])
  end

  def set_invoice
    to_be_included = [
      {
        activity_track: [
          {
            project_contract: [:user]
          }
        ]
      }
    ]
    if @project.is_owner?(current_user)
      @invoice = @project.invoices.includes(invoice_entries: to_be_included).find(params[:id])
    elsif @project.is_client? current_user
      @invoice = @project.invoices.includes(invoice_entries: to_be_included).for_client_visible.find(params[:id])
    else
      @invoice = current_user.invoices.find(params[:id])
    end
  end

  def invoice_params
    params.require(:invoice).permit(
      :currency,
      :discount_percentage,
      :from,
      :to,
      :is_client_visible
    )
  end

  def update_invoice_params
    if current_user.is_admin?
      params.require(:invoice).permit(
        :currency,
        :is_client_visible,
        :discount_percentage,
        invoice_entries_attributes: %i[id description rate from to]
      )
    else
      params.require(:invoice).permit(
        :currency,
        :discount_percentage
      )
    end
  end

  def upload_invoice_params
    begin
      params[:invoice][:invoice].open
    rescue StandardError
    end
    params.require(:invoice).permit(:invoice)
  end

  def upload_payment_params
    begin
      params[:invoice][:payment].open
    rescue StandardError
    end
    params.require(:invoice).permit(:invoice, :payment, :exchange)
  end
end
