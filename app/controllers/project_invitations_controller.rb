class ProjectInvitationsController < ApplicationController
  before_action :authenticate_user!

  before_action :set_project, only: %i[new create accept decline]

  before_action :set_invitation, only: %i[accept decline]

  before_action :project_pay_wall, only: [
    :new,
    :create
  ]

  load_and_authorize_resource

  # def index; end

  # def show; end

  def new
    track_page_view("auth/project_invitations/new")

    @invitation = @project.project_invitations.new(user: current_user)
  end

  # def edit; end

  def create
    track_page_view("auth/project_invitations/create")

    params = project_invitation_params.merge(user: current_user)
    @invitation = @project.project_invitations.new(params)

    respond_to do |format|
      if @invitation.save
        ProjectInvitationMailer.invite(@invitation).deliver_later
        format.html { redirect_to @project, notice: t(:project_member_successfully_invited) }
        format.json { render :show, status: :created, location: @project }
      else
        format.html { render :new }
        format.json { render json: @invitation.errors, status: :unprocessable_entity }
      end
    end
  end

  def accept
    track_page_view("auth/project_invitations/accept")

    @invitation.accept
    redirect_to @project
  end

  def decline
    track_page_view("auth/project_invitations/decline")

    @invitation.decline
    redirect_to home_path
  end

  # def update; end

  # def destroy; end

  private

  def set_project
    @project = Project.friendly.find(params[:project_id])
  end

  def set_invitation
    @invitation = @project.project_invitations.find(params[:id])
  end

  def project_invitation_params
    params.require(:project_invitation).permit(
      :email,
      :activity,
      :project_rate,
      :user_rate
    )
  end
end
