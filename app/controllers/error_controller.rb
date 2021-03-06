# frozen_string_literal: true

class ErrorController < ApplicationController
  layout 'application'

  def not_found
    render status: 404
  end

  def internal_error
    render status: 500
  end

  def unacceptable
    render status: 422
  end
end
