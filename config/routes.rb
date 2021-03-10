# frozen_string_literal: true

Rails.application.routes.draw do
  # match '/404', to: 'error#not_found', via: :all
  # match '/422', to: 'error#unacceptable', via: :all
  # match '/500', to: 'error#internal_error', via: :all

  # Get the information of the current logged user
  get '/me', to: 'users#me'

  resources :clients, except: [:show]
  resources :invoices, only: [:index, :show, :new, :create, :update] do
    post :make_visible, on: :member
  end

  resources :users do
    post :become, on: :member
  end

  resources :analytics

  resources :activity_stop_watches, only: [:create] do
    post :resume_from_track, on: :collection
  end

  resources :projects do
    resources :invoice_statuses, module: :projects, only: [] do
      post :confirm_hours, on: :member
    end

    get :onboarding, on: :member
    post :update_rate_from_onboarding, on: :member
    get :onboarding_invite_members, on: :member
    post :invite_member_from_onboarding, on: :member
    get :onboarding_done, on: :member

    get :status_period, on: :member

    resources :project_invitations do
      post :accept, on: :member
      post :decline, on: :member
    end

    resources :project_contracts, module: :projects, except: [:index]

    resources :activity_tracks, module: :projects, except: [:index]
    resources :activity_stop_watches, module: :projects, except: [:index] do
      post :stop, on: :member
      post :resume, on: :member
      post :destroy, on: :member
      post :finish, on: :member
    end

    resources :invoices, module: :projects do
      post :add_entries_to_client_invoice, on: :member
      post :make_internal, on: :member
      post :make_client, on: :member
      post :email_notify, on: :member
      post :make_visible, on: :member
      post :hide, on: :member
      post :upload_invoice, on: :member
      post :upload_payment, on: :member
      get :download_invoice, on: :member
      get :download_payment, on: :member
      get :review_entries, on: :member
      get :status, on: :member
    end
  end

  resources :feedback_options, only: [:index]
  resources :submissions, only: [:create]
  resources :other_submissions, only: [:create]

  get '/', to: 'home#index', as: 'home'
  get '/login', to: 'sessions#index', as: 'login'
  delete '/logout', to: 'sessions#destroy', as: 'destroy_user_session'
  get '/sessions/:token', to: 'sessions#new'
  get '/settings', to: 'home#settings', as: 'settings'
  get '/company_settings', to: 'home#company_settings', as: 'company_settings'
  get '/subscription', to: 'home#subscription', as: 'subscription'
  post '/subscription/cancel', to: 'home#cancel_subscription', as: 'cancel_subscription'
  get '/solutions', to: 'home#solutions', as: 'home_solutions'
  get '/privacy-policy', to: 'pages#privacy_policy', as: 'privacy_policy'
  get '/terms-and-conditions', to: 'pages#terms_and_conditions', as: 'terms_and_conditions'
  get '/robots.:format', to: 'pages#robots'
  get '/sitemap.:format', to: 'pages#sitemap'
  root to: redirect('/')
end
