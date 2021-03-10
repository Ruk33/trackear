# frozen_string_literal: true

class Invoice < ApplicationRecord
  include Shrine::Attachment(:invoice)
  include Shrine::Attachment(:payment)

  acts_as_paranoid

  monetize :afip_price_cents, with_currency: :ars
  monetize :exchange_cents, with_currency: :ars

  belongs_to :project
  belongs_to :user
  belongs_to :client, optional: true
  has_one :invoice_status
  has_many :invoice_entries

  accepts_nested_attributes_for :invoice_entries, allow_destroy: true

  after_create :create_entries_for_member_invoice, unless: :is_client_visible?

  before_update :calc_and_set_afip_amount, if: :exchange_cents_changed?

  scope :for_client, -> { where(is_client_visible: true) }
  scope :for_client_visible, -> { where(is_visible: true).where(is_client_visible: true) }

  scope :in_range, ->(a, b) { where(['"invoices"."from" >= ? and "invoices"."to" >= ?', a, b]) }

  default_scope { order(created_at: :desc) }

  def fixed_price
    first_entry = invoice_entries.first
    return 0 if first_entry.nil?

    first_entry.activity_track.project_contract.user_fixed_rate || 0
  end

  def fixed_price?
    fixed_price.positive?
  end

  def calculate_afip_amount_in_ars
    return Money.new(fixed_price * 100, 'ARS') if fixed_price?

    Money.add_rate('USD', 'ARS', exchange_cents)
    total = Money.new(calculate_total, 'USD')
    total.exchange_to('ARS')
  end

  def calc_and_set_afip_amount
    afip_amount = calculate_afip_amount_in_ars
    update_columns(
      afip_price_cents: afip_amount.fractional,
      afip_price_currency: afip_amount.currency.iso_code
    )
  end

  def add_payment(params)
    update(params)
    invoice_status.admin_add_client_payment(exchange) if is_client_visible?
    invoice_status.member_add_payment unless is_client_visible?
    true
  end

  # Upload/attach an invoice file and
  # update invoice status if required
  def add_invoice(params)
    update(params)
    invoice_status.user_add_invoice unless is_client_visible?
    true
  end

  def add_entries_to_client_invoice
    return unless is_client_visible?

    contracts = project.project_contracts

    contracts.each do |contract|
      logged = contract.activity_tracks.logged_in_period(from, to)
      logged.each do |activity|
        invoice_entries.create(
          rate: activity.safe_project_rate,
          activity_track: activity,
          description: activity.description,
          from: activity.from,
          to: activity.to
        )
      end
    end

    invoice_status.admin_entries_added_to_client_invoice
  end

  def notify_client
    return unless is_client_visible?
    update(is_visible: true)
  end

  def self.new_team_member_invoice(client_invoice)
    new(
      is_client_visible: false,
      from: client_invoice.from,
      to: client_invoice.to,
      project: client_invoice.project,
      discount_percentage: 0
    )
  end

  def calculate_subtotal
    invoice_entries.collect(&:calculate_total).sum
  end

  def calculate_total
    return fixed_price if fixed_price?

    calculate_subtotal * ((100 - discount_percentage) / 100)
  end

  def calculate_hours
    invoice_entries.collect(&:calculate_quantity).sum
  end

  def calculate_revenue
    invoice_entries.collect(&:calculate_project_total).sum - calculate_total
  end

  def is_paid?
    return true if calculate_total == 0 && invoice_status && invoice_status.is_completed?

    payment.present?
  end

  def is_unpaid?
    !is_paid?
  end

  def build_entries_without_saving
    contracts = project.project_contracts.where(user: user)

    contracts.each do |contract|
      logged = contract.activity_tracks.logged_in_period(from, to)
      logged.each do |activity|
        invoice_entries.build(
          rate: activity.safe_user_rate,
          activity_track: activity,
          description: activity.description,
          from: activity.from,
          to: activity.to
        )
      end
    end
  end

  def make_visible
    update(is_visible: true, is_client_visible: true)
  end

  private

  def create_admin_invoice_status
    status = InvoiceStatus.new
    status.invoice = self
    status.status = InvoiceStatus.statuses[:admin_waiting_for_hours_confirmation]
    status.user = user
    status.save
  end

  def create_entries_for_member_invoice
    build_entries_without_saving
    save
  end
end
