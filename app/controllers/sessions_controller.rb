class SessionsController < ApplicationController
  def index
    redirect_to ENV['LOGIN_URL']
  end

  def new
    begin
      token = params[:token]

      session_from_auth = Session.find_by(token: token, used: false)
      session_from_auth.update(used: true)
      session[:user_id] = session_from_auth.user_id

      user = User.find(session_from_auth.user_id)
      user.update(trial_ends_at: 30.days.from_now) if user.trial_ends_at.nil?

      redirect_to root_url
    rescue
      redirect_to root_url
    end
  end

  def destroy
    impersonating_from = session[:impersonating_from]
    if impersonating_from.present?
      session[:user_id] = impersonating_from
      session[:impersonating_from] = nil
    else
      session[:user_id] = nil
    end
    redirect_to root_url
  end
end
