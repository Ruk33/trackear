# frozen_string_literal: true

json.array! @project_contracts, partial: 'project_contracts/project_contract', as: :project_contract
