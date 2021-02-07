# frozen_string_literal: true

json.extract! project_contract, :id, :created_at, :updated_at
json.url project_contract_url(project_contract, format: :json)
