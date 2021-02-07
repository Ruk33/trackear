class ActivityStopWatchesController < ApplicationController
  # before_action :authenticate_user!

  load_and_authorize_resource

  def resume_from_track
    track = current_user.activity_tracks.find(params[:track_id])
    watches = current_user.activity_stop_watches
    watches.from_track(track).create(start: DateTime.now)

    redirect_to root_path, notice: t(:stopwatch_running)
  end

  def create
    params = activity_stop_watch_params
    @activity_stop_watch = current_user.activity_stop_watches.new(params)
    @activity_stop_watch.start = DateTime.now
    @activity_stop_watch.save
    redirect_back(fallback_location: @project, notice: t(:stopwatch_running))
  end

  private

  def activity_stop_watch_params
    params.require(:activity_stop_watch).permit(:description, :project_id)
  end
end
