# frozen_string_literal: true

class Projects::ProjectContractsController < ApplicationController
  before_action :authenticate_user!

  before_action :set_project, only: %i[show new create edit update destroy]

  before_action :set_project_contract, only: %i[show edit update destroy]

  before_action :project_pay_wall, only: [
    :new,
    :edit,
    :create,
    :update,
    :update
  ]

  load_and_authorize_resource

  # GET /project_contracts
  # GET /project_contracts.json
  def index
    track_page_view("auth/project_contracts/index")
    @project_contracts = ProjectContract.all
  end

  # GET /project_contracts/1
  # GET /project_contracts/1.json
  def show
    track_page_view("auth/project_contracts/show")
  end

  # GET /project_contracts/new
  def new
    track_page_view("auth/project_contracts/new")

    redirect_to new_project_project_invitation_path(@project)
    # @project_contract = @project.project_contracts.new
    # add_breadcrumb @project.name, @project
    # add_breadcrumb t :add_member
  end

  # GET /project_contracts/1/edit
  def edit
    track_page_view("auth/project_contracts/edit")

    @members = User.all
    add_breadcrumb @project.name, @project
    add_breadcrumb t :edit_contract
  end

  # POST /project_contracts
  # POST /project_contracts.json
  def create
    # @project_contract = @project.project_contracts.from_invite(invite_member_params)

    # add_breadcrumb @project.name, @project
    # add_breadcrumb t :add_member

    # respond_to do |format|
    #   if @project_contract.save
    #     format.html { redirect_to @project_contract.project, notice: t(:project_member_successfully_invited) }
    #     format.json { render :show, status: :created, location: @project_contract.project }
    #   else
    #     format.html { render :new }
    #     format.json { render json: @project_contract.errors, status: :unprocessable_entity }
    #   end
    # end
  end

  # PATCH/PUT /project_contracts/1
  # PATCH/PUT /project_contracts/1.json
  def update
    track_page_view("auth/project_contracts/update")

    add_breadcrumb @project.name, @project
    add_breadcrumb t :edit_contract

    respond_to do |format|
      if @project_contract.update(project_contract_params)
        format.html { redirect_to @project, notice: t(:project_member_successfully_updated) }
        format.json { render :show, status: :ok, location: @project }
      else
        format.html { render :edit }
        format.json { render json: @project_contract.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /project_contracts/1
  # DELETE /project_contracts/1.json
  def destroy
    track_page_view("auth/project_contracts/destroy")

    @project_contract.destroy
    respond_to do |format|
      format.html { redirect_to home_url, notice: t(:project_member_successfully_destroyed) }
      format.json { head :no_content }
    end
  end

  private

  def set_project
    @project = current_user.projects.friendly.find(params[:project_id])
  end

  def set_project_contract
    @project_contract = @project.project_contracts.find(params[:id])
  end

  def project_contract_params
    params.require(:project_contract).permit(
      :user_id,
      :activity,
      :active_from,
      :ends_at,
      :project_rate,
      :user_rate,
      :user_fixed_rate,
      :is_admin
    )
  end

  def invite_member_params
    params.require(:project_contract).permit(
      :user_email,
      :activity,
      :project_rate,
      :user_rate,
      :user_fixed_rate
    )
  end
end
