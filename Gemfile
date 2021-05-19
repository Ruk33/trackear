# frozen_string_literal: true

source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby '2.7.2'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '~> 6.0.2'
# Use postgresql as the database for Active Record
gem 'pg', '>= 0.18', '< 2.0'
# Use Puma as the app server
gem 'puma', '~> 4.3'

# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 2.7'
# Use Redis adapter to run Action Cable in production
# gem 'redis', '~> 4.0'
# Use ActiveModel has_secure_password
gem 'bcrypt', '~> 3.1.7'

# Reduces boot times through caching; required in config/boot.rb
gem 'bootsnap', '>= 1.1.0', require: false

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug', platforms: %i[mri mingw x64_mingw]
  gem 'factory_bot_rails'
  gem 'cypress-on-rails', '~> 1.0'
end

group :development do
  gem 'rubocop', '~> 0.81.0'
  # Access an interactive console on exception pages or by calling 'console' anywhere in the code.
  gem 'listen', '>= 3.0.5', '< 3.2'
  gem 'web-console', '>= 3.3.0'
  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'letter_opener'
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'

  gem 'better_errors'
  gem 'binding_of_caller'

  gem 'rack-mini-profiler'

  # For memory profiling
  gem 'memory_profiler'

  gem 'bullet'
end

group :test do
  # Adds support for Capybara system testing and selenium driver
  gem 'capybara', '>= 2.15'
  gem 'selenium-webdriver'
  # Easy installation and use of chromedriver to run system tests with Chrome
  gem 'chromedriver-helper', '1.2.0'
  gem 'database_cleaner-active_record'
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: %i[mingw mswin x64_mingw jruby]

gem 'cancancan', '~> 3.0.2'

gem 'money-rails', '~> 1.13.3'

gem 'friendly_id', '~> 5.3.0'

gem 'date_validator', '~> 0.9.0'

gem 'dotiw', '~> 4.0.1'

gem 'shrine', '~> 3.3'

gem 'secure_headers', '~> 6.3.0'

gem 'rack-attack', '~> 6.2.2'

gem 'fog-aws', '~> 3.6.2'

gem 'aws-sdk-s3', '~> 1.14'

gem 'will_paginate', '~> 3.1.0'

gem 'cocoon', '~> 1.2.14'

gem 'acts_as_paranoid', '~> 0.6.3'

gem 'webpacker', '~> 5.1'

gem 'sitemap_generator'

gem 'breadcrumbs_on_rails'

gem 'turbolinks', '~> 5.2.0'

gem 'sentry-raven'

gem 'receipts'

gem 'pay', git: 'https://github.com/nm/pay.git', branch: 'paddle'
gem 'paddle_pay', '~> 0.0.1'

gem 'browser'
gem 'geocoder'

gem 'chartkick'
gem 'groupdate'
