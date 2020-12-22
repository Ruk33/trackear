class AnalyticsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_analytic, only: [:show, :edit, :update, :destroy]
  load_and_authorize_resource

  # GET /analytics
  # GET /analytics.json
  def index
    @new_users = Analytic.new_users.from_months(6).group_by_months.count
    @invoice_feature = Analytic.feature_popularity("auth/invoices").from_months(6).group_by_months.count
    @project_invitation_feature = Analytic.feature_popularity("auth/project_invitations").from_months(6).group_by_months.count
    @projects_feature = Analytic.feature_popularity("auth/projects").from_months(6).group_by_months.count
    @projects_created = Analytic.feature_popularity("auth/projects/create").from_months(6).group_by_months.count
    @invoices_created = Analytic.feature_popularity("auth/invoices/create").from_months(6).group_by_months.count
    @active_users = Analytic.active_users.from_months(6).group_by_months.count
    @active_guests = Analytic.active_guests.from_months(6).group_by_months.count
    @project_invitations = Analytic.feature_popularity("auth/project_invitations/create").from_months(6).group_by_months.count
    @retention_rate = Analytic.retention_rate_by_months(6)
  end

  # GET /analytics/1
  # GET /analytics/1.json
  def show
  end

  # GET /analytics/new
  def new
    @analytic = Analytic.new
  end

  # GET /analytics/1/edit
  def edit
  end

  # POST /analytics
  # POST /analytics.json
  def create
    @analytic = Analytic.new(analytic_params)

    respond_to do |format|
      if @analytic.save
        format.html { redirect_to @analytic, notice: 'Analytic was successfully created.' }
        format.json { render :show, status: :created, location: @analytic }
      else
        format.html { render :new }
        format.json { render json: @analytic.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /analytics/1
  # PATCH/PUT /analytics/1.json
  def update
    respond_to do |format|
      if @analytic.update(analytic_params)
        format.html { redirect_to @analytic, notice: 'Analytic was successfully updated.' }
        format.json { render :show, status: :ok, location: @analytic }
      else
        format.html { render :edit }
        format.json { render json: @analytic.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /analytics/1
  # DELETE /analytics/1.json
  def destroy
    @analytic.destroy
    respond_to do |format|
      format.html { redirect_to analytics_url, notice: 'Analytic was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_analytic
      @analytic = Analytic.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def analytic_params
      params.require(:analytic).permit(:event, :value, :created_at)
    end
end
