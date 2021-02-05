# frozen_string_literal: true

class ActivityTrackService
  def self.all_from(projects, users, from, to)
    contracts = ProjectContract.where(user_id: users)
    contracts = contracts.where(project_id: projects) if projects.any?
    ActivityTrack.where(project_contract: contracts).logged_in_period(from, to)
  end

  def self.log_from_today?(project, user)
    all_from_range(project, user, Date.today, Date.today).any?
  end

  def self.all_from_range(project, user, from, to)
    user_contracts = project.project_contracts.where(user: user)
    tracks_from_user_contracts = ActivityTrack.where(project_contract: user_contracts)
    tracks_in_range = tracks_from_user_contracts.logged_in_period(from, to)
    tracks_in_range
  end
end
