# frozen_string_literal: true

class UsersController < ApplicationController
  before_action :authenticate_user!
  before_action :set_user, only: %i[become show edit update destroy]
  load_and_authorize_resource

  # GET /users
  # GET /users.json
  def index
    @users = User.all.order(created_at: :desc)
  end

  # GET /users/1
  # GET /users/1.json
  def show; end

  # GET /users/new
  def new
    @user = User.new
  end

  # GET /users/1/edit
  def edit; end

  # POST /users
  # POST /users.json
  def create
    @user = User.new(user_params)
    @user.password = Devise.friendly_token[0, 20]

    respond_to do |format|
      if @user.save
        format.html { redirect_to users_url, notice: 'User was successfully created.' }
        format.json { render :show, status: :created, location: @user }
      else
        format.html { render :new }
        format.json { render json: @user.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /users/1
  # PATCH/PUT /users/1.json
  def update
    @user.update(update_user_params)
    respond_to do |format|
      format.html { redirect_to settings_url, notice: 'Successfully updated.' }
      format.json { render :show, status: :ok, location: @user }
    end
  end

  # DELETE /users/1
  # DELETE /users/1.json
  def destroy
    @user.destroy
    respond_to do |format|
      format.html { redirect_to users_url, notice: 'User was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  def become
    session[:impersonating_from] = current_user.id
    session[:user_id] = @user.id
    redirect_to home_url
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_user
    @user = User.friendly.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def user_params
    params.require(:user).permit(:picture, :email, :first_name, :last_name, :is_premium, :is_admin)
  end

  def update_user_params
    params.require(:user).permit(
      :first_name,
      :last_name,
      :locale,
      :time_zone,
      :company_logo,
      :company_name,
      :company_address,
      :company_email
    )
  end

  def user_locale_params
    params.require(:user).permit(:locale)
  end
end
