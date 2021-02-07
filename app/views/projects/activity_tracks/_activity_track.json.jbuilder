# frozen_string_literal: true

json.extract! activity_track, :id, :created_at, :updated_at
json.url activity_track_url(activity_track, format: :json)
