# frozen_string_literal: true
json.array! @all_logs.as_json(methods: [:start, :end, :title, :url, :calendar_billable])
