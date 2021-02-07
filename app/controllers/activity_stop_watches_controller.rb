class ActivityStopWatchesController < ApplicationController
  before_action :authenticate_user!

  # Create a new stop watch from
  # another activity track.
  def resume_from_track
    track = current_user.activity_tracks.find(params[:track_id])
    watches = current_user.activity_stop_watches
    watches.from_track(track).create(start: DateTime.now)

    redirect_to root_path, notice: t(:stopwatch_running)
  end

  # Create new stop watch by sending
  # project and description.
  # Used in dashboard where the user
  # can select from all his/her projects.
  def create
    params = activity_stop_watch_params

    @activity_stop_watch = current_user.activity_stop_watches.new(params)

    # Make sure we only create
    # the entry if current user has access
    # to the project.
    authorize! :read, @activity_stop_watch.project

    @activity_stop_watch.start = DateTime.now
    @activity_stop_watch.save

    redirect_back(fallback_location: @project, notice: t(:stopwatch_running))
  end

  private

  def activity_stop_watch_params
    params.require(:activity_stop_watch).permit(:description, :project_id)
  end
end
