# frozen_string_literal: true

class Ability
  include CanCan::Ability

  def initialize(user)
    return unless user.present?

    user_ability(user)
    project_ability(user)
    invoice_ability(user)
    activity_track_ability(user)

    can :manage, :all if user.is_admin?
  end

  def user_ability(user)
    can :me, User, id: user.id
    can :update_locale, User, id: user.id
    can :update, User, id: user.id
  end

  def project_ability(user)
    can :create, Project
    can :read, Project, users: { id: user.id }
    can :status_period, Project, users: { id: user.id }
    can :status_period, ProjectContract, { user: user }

    # Legacy, remove when activity="Creator" is no longer used
    can :manage, Project, project_contracts: { user: user, activity: 'Creator' }
    can :manage, Project, project_contracts: { user: user, is_admin: true }

    # Legacy, remove when activity="Creator" is no longer used
    can :manage, [ProjectContract, ProjectInvitation], project: { project_contracts: { user: user, activity: 'Creator' } }
    can :manage, [ProjectContract, ProjectInvitation], project: { project_contracts: { user: user, is_admin: true } }
    can [:accept, :decline], ProjectInvitation, email: user.email

    can [:create, :new], [ProjectContract, ProjectInvitation]
  end

  def invoice_ability(user)
    can [:index, :show, :email_notify], Invoice, user: user
    can :show, Invoice, user: user
    can :show, Invoice, is_client_visible: true, is_visible: true, project: {
      project_contracts: { user: user, activity: 'Client' }
    }
    can :download_invoice, Invoice, user: user
    can :download_payment, Invoice, user: user
    can :upload_invoice, Invoice, user: user

    # Allow to read the invoice status
    can :status, Invoice, user: user

    # Legacy, remove when activity="Creator" is no longer used
    can :manage, Invoice, project: { project_contracts: { user: user, activity: 'Creator' } }
    can :manage, Invoice, project: { project_contracts: { user: user, is_admin: true } }
  end

  def activity_track_ability(user)
    can :manage, ActivityTrack, project_contract: { user: user }
    can :create, ActivityTrack
    can :manage, ActivityStopWatch
  end
end
