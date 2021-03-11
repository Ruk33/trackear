# frozen_string_literal: true

class InvoiceService
  def self.invoices_from(user, project)
    if project.is_owner?(user)
      project.invoices.includes(:user).order(from: :desc)
    elsif project.is_client? user
      project.invoices.includes(:user).for_client_visible.order(from: :desc)
    else
      user.invoices.includes(:user).where(project: project).order(from: :desc)
    end
  end

  # Get all the work tracks visible for a user from a project and period of time.
  # If the user is admin of the project, we return all the tracks.
  # If the user isn't admin, we return only his/her tracks.
  def self.work_entries_from_period(user, project, from, to)
    is_project_admin = project.is_owner? user
    all_contracts = project.project_contracts.currently_active.only_team.includes(:user)
    contracts_visible_to_user = all_contracts

    unless is_project_admin
      contracts_visible_to_user = all_contracts.select { |contract| contract.user.id == user.id }
    end

    entries = contracts_visible_to_user.map do |contract|
      {
        user: {
          email: contract.user.email,
          first_name: contract.user.first_name,
          last_name: contract.user.last_name,
        },
        contract: {
          project_rate: is_project_admin ? contract.project_rate : contract.user_rate,
        },
        tracks: ActivityTrackService.all_from_range(project, contract.user, from, to).map do |track|
          {
            description: track.description,
            from: track.from,
            to: track.to,
            id: track.id,
            project_rate: is_project_admin ? track.project_rate : track.user_rate,
          }
        end
      }
    end
  end
end
