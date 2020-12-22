# Trackear.app
Trackear is a simple web application for freelancers to track work and generate invoices.

You can use it for free in https://www.trackear.app/.

## Docker installation
- Install [Docker](https://docs.docker.com/get-docker/)
- Install [Docker compose](https://docs.docker.com/compose/install/)
- Make a copy of `env.sample.yml` and name it `env.yml`
- Make sure to complete with a valid GOOGLE API KEY (https://console.developers.google.com/)
- Run `docker-compose build`
- Run `docker-compose up`
- Run `sh rails.sh db:create db:migrate`

## Installation steps
- Install [RVM](https://rvm.io/)
- Install [NVM](https://github.com/nvm-sh/nvm)
- Install ruby with `rvm install 2.6.6`
- Install node with `nvm install node`
- Install yarn with `npm i -g yarn`
- Install bundler with `gem install bundler`
- Install dependencies with `bundle install` and `yarn`
- Make a copy of `env.sample.yml` and name it `env.yml`
- Make sure to complete with a valid GOOGLE API KEY (https://console.developers.google.com/)
- Initiate the database with `docker-compose up -d db` (if you have PSQL installed and running, this step is not required)
- Create the database and run the migrations with `rails db:create db:migrate`
- Go to http://localhost:3000/ (first time may take a while since assets are being compiled)

## Tech stack
- Ruby
- Ruby on Rails
- PSQL
- Elm
- SASS
- Cypress

## Entities
Please review our ENTITIES.md file for more information about the entities / models (users, invoices, etc.) in the project.

## End to end test
- Install test dependencies with `bundle install --with=development,test`
- Create test database and run migrations with `RAILS_ENV=test rails db:create db:migrate`
- Start rails in test mode with `rails s -e test`
- Run cypress with `yarn e2e`
- Search for `app`
- Run all specs

## End to end test on Windows
- Install test dependencies with `bundle install --with=development,test`
- Set environment to test with `set RAILS_ENV=test`
- Create test database and run migrations with `rails db:create db:migrate`
- Start rails in test mode with `rails s -e test`
- Run cypress with `yarn e2e`
- Search for `app`
- Run all specs

## Deploy
Trackear is using [capistrano](https://capistranorb.com/) to handle deployments.

- Install [RVM](https://rvm.io/) on your server.
- Install [NVM](https://github.com/nvm-sh/nvm) on your server
- Install `nginx` in your server (ie `sudo apt install nginx`)
- Install `ruby` in your server with `rvm install ruby-2.6.6`
- Install `bundler` on your server with `gem install bundler`
- Install `node` in your server with `nvm install node`
- Install `yarn` in your server with `npm i -g yarn`
- Create [SSL certificate](https://letsencrypt.org/) (ie `certbot -d *.example.com -d example.com --manual --preferred-challenges dns certonly`)
- Store `fullchain.pem` & `privkey.pem` from your certificate under `cert/<environment>`, where `environment` is development, production or whatever your environment name is. DO NOT commit these files.
- Update `deploy/<environment>.rb` with your server's credentials, ie: `server "YOUR-IP", user: "root", roles: %w{app db web}`
- Deploy with `bundle exec cap <environment> deploy`
- Restart nginx to pick the new configuration up (ie `sudo nginx -t && sudo systemctl reload nginx`)

## FAQ
Please review our FAQ.md file.

## Contributing
Thank you for considering contributing to this project, we really appreciate it!

There are many ways you can contribute:

- Report bug or issues
- Suggest new features
- Contribute with translations
- Contribute with art / style improvement
- Contribute with code changes
- Donations

Please before doing so, make sure to check our CONTRIBUTING.md file and be sure to create a new Github issue so we can be in sync and well organized.

## Donations
Trackear.app is an application / project intended to be fully free. If you would like to contribute with donations to help us, you can do so with the following links.

- [Donation 50 ARS](https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=114997172-e63f95ba-8a6f-45c8-9007-f67087588812)
- [Donation 100 ARS](https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=114997172-425093a5-2c89-4253-9536-66cb7dc6a314)
- [Donation 250 ARS](https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=114997172-9735ce3a-6445-4cf0-b0d0-0f49d1cdaff3)
- [Donation 500 ARS](https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=114997172-ceadee56-00df-48d2-82e0-5168b8c34a0e)

## License
Please review our LICENSE.md file.
