# frozen_string_literal: true

class Projects::ActivityStopWatchesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_project
  before_action :set_activity_stop_watch, only: [:destroy, :stop, :resume, :finish]
  before_action :project_pay_wall, only: [:create]

  load_and_authorize_resource

  def create
    params = activity_stop_watch_params
    @activity_stop_watch = current_user.activity_stop_watches.new(params)
    @activity_stop_watch.start = DateTime.now
    @activity_stop_watch.save
    redirect_back(fallback_location: @project, notice: t(:stopwatch_running))
  end

  def destroy
    @activity_stop_watch.destroy
    redirect_back(fallback_location: @project, notice: t(:stopwatch_successfully_detroyed))
  end

  def stop
    @activity_stop_watch.stop
    respond_to do |format|
      format.html { redirect_to @project, notice: 'Stopwatch paused' }
    end
  end

  def resume
    @activity_stop_watch.resume
    respond_to do |format|
      format.html { redirect_to @project, notice: 'Resumed stopwatch' }
    end
  end

  def finish
    active_contract = current_user.currently_active_contract_for(@project)
    @activity_stop_watch.finish(active_contract)
    respond_to do |format|
      format.html { redirect_to @project, notice: t(:activity_track_added_from_stopwatch) }
    end
  end

  private

  def set_activity_stop_watch
    @activity_stop_watch = current_user.activity_stop_watches.find(params[:id])
  end

  def set_project
    projects = current_user.projects
    @project = projects.friendly.find(params[:project_id])
  end

  def activity_stop_watch_params
    params.require(:activity_stop_watch).permit(:description)
  end
end
