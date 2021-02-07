# frozen_string_literal: true

class Projects::ActivityTracksController < ApplicationController
  before_action :authenticate_user!

  before_action :set_currently_active_contract, only: %i[show new create edit update destroy]

  before_action :set_activity_track, only: %i[show edit update destroy]

  before_action :project_pay_wall, only: [
    :new,
    :create,
    :edit,
    :update
  ]

  load_and_authorize_resource

  # GET /activity_tracks
  # GET /activity_tracks.json
  def index
    @activity_tracks = ActivityTrack.all
  end

  # GET /activity_tracks/1
  # GET /activity_tracks/1.json
  def show; end

  # GET /activity_tracks/new
  def new
    @activity_track = @active_contract.activity_tracks.new(from: Date.today)
    @activity_track.project_rate = @active_contract.project_rate
    @activity_track.user_rate = @active_contract.user_rate
    add_breadcrumb @project.name, @project
    add_breadcrumb t :new_activity_track
  end

  # GET /activity_tracks/1/edit
  def edit
    add_breadcrumb @project.name, @project
    add_breadcrumb t :edit_activity_track
  end

  # POST /activity_tracks
  # POST /activity_tracks.json
  def create
    @activity_track = @active_contract.activity_tracks.new(activity_track_params)
    add_breadcrumb @project.name, @project
    add_breadcrumb t :new_activity_track

    respond_to do |format|
      if @activity_track.save
        format.html { redirect_to @project, notice: t(:activity_track_successfully_added) }
        format.json { render :show, status: :created, location: @activity_track }
      else
        format.html { render :new }
        format.json { render json: @activity_track.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /activity_tracks/1
  # PATCH/PUT /activity_tracks/1.json
  def update
    respond_to do |format|
      if @activity_track.update(activity_track_params)
        format.html { redirect_to @project, notice: t(:activity_track_successfully_updated) }
        format.json { render :show, status: :ok, location: @project }
      else
        format.html { render :edit }
        format.json { render json: @activity_track.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /activity_tracks/1
  # DELETE /activity_tracks/1.json
  def destroy
    @activity_track.destroy
    respond_to do |format|
      format.html { redirect_to @project, notice: t(:activity_track_successfully_destroyed) }
      format.json { head :no_content }
    end
  end

  private

  def set_currently_active_contract
    @project = current_user.projects.friendly.find(params[:project_id])
    @active_contract = current_user.currently_active_contract_for(@project)
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_activity_track
    @activity_track = @active_contract.activity_tracks.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def activity_track_params
    if @project.is_owner? current_user
      params.require(:activity_track).permit(:project_rate, :user_rate, :from, :hours, :description)
    else
      params.require(:activity_track).permit(:from, :hours, :description)
    end
  end
end
