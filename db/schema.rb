# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2020_12_21_174434) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "activity_stop_watches", force: :cascade do |t|
    t.datetime "start"
    t.datetime "end"
    t.boolean "paused"
    t.bigint "activity_track_id"
    t.bigint "user_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "description"
    t.bigint "project_id", null: false
    t.index ["activity_track_id"], name: "index_activity_stop_watches_on_activity_track_id"
    t.index ["project_id"], name: "index_activity_stop_watches_on_project_id"
    t.index ["user_id"], name: "index_activity_stop_watches_on_user_id"
  end

  create_table "activity_tracks", force: :cascade do |t|
    t.string "description"
    t.datetime "from"
    t.datetime "to"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "project_contract_id"
    t.datetime "deleted_at"
    t.decimal "user_rate"
    t.decimal "project_rate"
    t.integer "billable_cents", default: 0, null: false
    t.string "billable_currency", default: "USD", null: false
    t.index ["deleted_at"], name: "index_activity_tracks_on_deleted_at"
    t.index ["project_contract_id"], name: "index_activity_tracks_on_project_contract_id"
  end

  create_table "analytics", force: :cascade do |t|
    t.string "event"
    t.string "value"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "feedback_options", force: :cascade do |t|
    t.string "title"
    t.text "summary"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "friendly_id_slugs", force: :cascade do |t|
    t.string "slug", null: false
    t.integer "sluggable_id", null: false
    t.string "sluggable_type", limit: 50
    t.string "scope"
    t.datetime "created_at"
    t.index ["slug", "sluggable_type", "scope"], name: "index_friendly_id_slugs_on_slug_and_sluggable_type_and_scope", unique: true
    t.index ["slug", "sluggable_type"], name: "index_friendly_id_slugs_on_slug_and_sluggable_type"
    t.index ["sluggable_type", "sluggable_id"], name: "index_friendly_id_slugs_on_sluggable_type_and_sluggable_id"
  end

  create_table "invoice_entries", force: :cascade do |t|
    t.string "description"
    t.decimal "rate"
    t.bigint "invoice_id"
    t.datetime "from"
    t.datetime "to"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "activity_track_id"
    t.index ["activity_track_id"], name: "index_invoice_entries_on_activity_track_id"
    t.index ["invoice_id"], name: "index_invoice_entries_on_invoice_id"
  end

  create_table "invoice_statuses", force: :cascade do |t|
    t.bigint "invoice_status_id"
    t.bigint "user_id", null: false
    t.bigint "invoice_id"
    t.string "status"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.datetime "last_checked"
    t.index ["invoice_id"], name: "index_invoice_statuses_on_invoice_id"
    t.index ["invoice_status_id"], name: "index_invoice_statuses_on_invoice_status_id"
    t.index ["user_id"], name: "index_invoice_statuses_on_user_id"
  end

  create_table "invoices", force: :cascade do |t|
    t.bigint "project_id"
    t.decimal "discount_percentage"
    t.string "currency"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.date "from"
    t.date "to"
    t.boolean "is_visible"
    t.bigint "user_id"
    t.text "invoice_data"
    t.text "payment_data"
    t.boolean "is_client_visible"
    t.datetime "deleted_at"
    t.integer "afip_price_cents", default: 0, null: false
    t.string "afip_price_currency", default: "USD", null: false
    t.integer "exchange_cents", default: 0, null: false
    t.string "exchange_currency", default: "USD", null: false
    t.index ["deleted_at"], name: "index_invoices_on_deleted_at"
    t.index ["project_id"], name: "index_invoices_on_project_id"
    t.index ["user_id"], name: "index_invoices_on_user_id"
  end

  create_table "other_submissions", force: :cascade do |t|
    t.text "summary"
    t.bigint "user_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["user_id"], name: "index_other_submissions_on_user_id"
  end

  create_table "pay_charges", id: :serial, force: :cascade do |t|
    t.string "owner_type"
    t.integer "owner_id"
    t.string "processor", null: false
    t.string "processor_id", null: false
    t.integer "amount", null: false
    t.integer "amount_refunded"
    t.string "card_type"
    t.string "card_last4"
    t.string "card_exp_month"
    t.string "card_exp_year"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string "receipt_url"
  end

  create_table "pay_subscriptions", id: :serial, force: :cascade do |t|
    t.string "owner_type"
    t.integer "owner_id"
    t.string "name", null: false
    t.string "processor", null: false
    t.string "processor_id", null: false
    t.string "processor_plan", null: false
    t.integer "quantity", default: 1, null: false
    t.datetime "trial_ends_at"
    t.datetime "ends_at"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string "status"
    t.string "update_url"
    t.string "cancel_url"
  end

  create_table "payments", force: :cascade do |t|
    t.string "payment_type"
    t.integer "billed_cents", default: 0, null: false
    t.string "billed_currency", default: "USD", null: false
    t.datetime "valid_until"
    t.bigint "user_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["user_id"], name: "index_payments_on_user_id"
  end

  create_table "project_contracts", force: :cascade do |t|
    t.bigint "project_id"
    t.bigint "user_id"
    t.string "activity"
    t.decimal "project_rate"
    t.decimal "user_rate"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.date "active_from"
    t.date "ends_at"
    t.decimal "user_fixed_rate"
    t.boolean "is_admin"
    t.datetime "deleted_at"
    t.index ["deleted_at"], name: "index_project_contracts_on_deleted_at"
    t.index ["project_id"], name: "index_project_contracts_on_project_id"
    t.index ["user_id"], name: "index_project_contracts_on_user_id"
  end

  create_table "project_invitations", force: :cascade do |t|
    t.string "email"
    t.string "token"
    t.bigint "user_id", null: false
    t.string "activity"
    t.bigint "project_id", null: false
    t.decimal "project_rate"
    t.decimal "user_rate"
    t.string "status"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["project_id"], name: "index_project_invitations_on_project_id"
    t.index ["user_id"], name: "index_project_invitations_on_user_id"
  end

  create_table "projects", force: :cascade do |t|
    t.string "name"
    t.string "currency"
    t.string "slug"
    t.text "icon_data"
    t.string "client_full_name"
    t.string "client_address"
    t.string "client_email"
    t.index ["slug"], name: "index_projects_on_slug", unique: true
  end

  create_table "submissions", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "feedback_option_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["feedback_option_id"], name: "index_submissions_on_feedback_option_id"
    t.index ["user_id"], name: "index_submissions_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet "current_sign_in_ip"
    t.inet "last_sign_in_ip"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "first_name"
    t.string "last_name"
    t.string "picture"
    t.string "slug"
    t.boolean "is_admin"
    t.boolean "is_premium"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string "unconfirmed_email"
    t.integer "failed_attempts", default: 0, null: false
    t.string "unlock_token"
    t.datetime "locked_at"
    t.string "locale", default: "es"
    t.string "time_zone"
    t.string "company_name"
    t.string "company_address"
    t.string "company_email"
    t.text "company_logo_data"
    t.string "processor"
    t.string "processor_id"
    t.datetime "trial_ends_at"
    t.string "card_type"
    t.string "card_last4"
    t.string "card_exp_month"
    t.string "card_exp_year"
    t.text "extra_billing_info"
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["slug"], name: "index_users_on_slug", unique: true
    t.index ["unlock_token"], name: "index_users_on_unlock_token", unique: true
  end

  add_foreign_key "activity_stop_watches", "activity_tracks"
  add_foreign_key "activity_stop_watches", "projects"
  add_foreign_key "activity_stop_watches", "users"
  add_foreign_key "invoice_entries", "invoices"
  add_foreign_key "invoice_statuses", "invoice_statuses"
  add_foreign_key "invoice_statuses", "invoices"
  add_foreign_key "invoice_statuses", "users"
  add_foreign_key "invoices", "projects"
  add_foreign_key "other_submissions", "users"
  add_foreign_key "payments", "users"
  add_foreign_key "project_contracts", "projects"
  add_foreign_key "project_contracts", "users"
  add_foreign_key "project_invitations", "projects"
  add_foreign_key "project_invitations", "users"
  add_foreign_key "submissions", "feedback_options"
  add_foreign_key "submissions", "users"
end
