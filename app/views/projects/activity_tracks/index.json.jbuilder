# frozen_string_literal: true

json.array! @activity_tracks, partial: 'activity_tracks/activity_track', as: :activity_track
