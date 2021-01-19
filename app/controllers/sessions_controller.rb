class SessionsController < ApplicationController
  def new
    token = params[:token]
    session_from_auth = Session.find_by(token: token, used: false)
    session_from_auth.update(used: true)
    session[:user_id] = session_from_auth.user_id
    redirect_to root_url
  end

  def destroy
    session[:user_id] = nil
    redirect_to root_url
  end
end
