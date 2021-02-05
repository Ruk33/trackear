# frozen_string_literal: true

class ActivityStopWatch < ApplicationRecord
  has_one :activity_track
  belongs_to :user
  belongs_to :project
  # acts_as_paranoid

  scope :running, ->() { where(activity_track_id: nil) }

  scope :active, ->(project) { where(project: project).where(activity_track_id: nil) }

  scope :from_track, ->(activity_track) {
    where(
      description: activity_track.description,
      user_id: activity_track.project_contract.user_id,
      project_id: activity_track.project_contract.project_id
    )
  }

  def stop
    update(paused: true)
  end

  def resume
    update(paused: false)
  end

  def finish(contract)
    updated_end = DateTime.now
    track = contract.activity_tracks.create(
      from: start,
      to: updated_end,
      description: description.empty? ? 'Sin descripción' : description
    )
    update(end: updated_end, activity_track_id: track.id)
  end
end
