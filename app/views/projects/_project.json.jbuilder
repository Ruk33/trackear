# frozen_string_literal: true

json.extract! project, :id
json.url project_url(project, format: :json)
