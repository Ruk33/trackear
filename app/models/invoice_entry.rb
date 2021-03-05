# frozen_string_literal: true

class InvoiceEntry < ApplicationRecord
  acts_as_paranoid

  belongs_to :invoice
  belongs_to :activity_track, with_deleted: true

  def calculate_quantity
    (to - from) / 1.hour
  end

  def calculate_total
    calculate_quantity * rate
  end

  def calculate_project_total
    calculate_quantity * activity_track.safe_project_rate
  end
end
