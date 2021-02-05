# Trackear.app
Trackear is a simple web application for freelancers to track work and
generate invoices.

Check it out at https://www.trackear.app/.

## Docker installation
- Install [Docker](https://docs.docker.com/get-docker/)
- Install [Docker compose](https://docs.docker.com/compose/install/)
- Make a copy of `env.sample.yml` and name it `env.yml`
- Make sure to complete with a valid GOOGLE API KEY (https://console.developers.google.com/)
- Run `docker-compose build`
- Run `docker-compose up`
- Run `sh rails.sh db:create db:migrate`

## Alternative installation steps
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
- Initiate the server with `rails s`
- Go to http://localhost:3000/ (first time may take a while since assets are being compiled)

## Problems loading assets
If you are experiencing problems loading the assets. Try disabling
the secure_headers gem by commenting the line in the Gemfile.
After that, run bundle and then restart the rails server.

## Assets
If compiling the assets takes a long time, you can speed it up by running `ruby bin/webpack-dev-server` in a new terminal.

## Tech stack
- Ruby
- Ruby on Rails
- PostgreSQL
- Elm
- SASS
- Cypress

## Entities
Please review our ENTITIES.md file for more information about the
entities/models (users, invoices, etc.) in the project.

## End to end test
- Install test dependencies with `bundle install --with=development,test`
- Create the test database and run migrations with `RAILS_ENV=test rails db:create db:migrate`
- Start rails in test mode with `rails s -e test`
- Run cypress with `yarn e2e`
- Search for `app`
- Run all specs

## End to end test on Windows
- Install test dependencies with `bundle install --with=development,test`
- Set the environment to test with `set RAILS_ENV=test`
- Create the test database and run migrations with `rails db:create db:migrate`
- Start rails in test mode with `rails s -e test`
- Run cypress with `yarn e2e`
- Search for `app`
- Run all specs

## FAQ
Please review our FAQ.md file.

## Contributing
Thank you for considering contributing to this project. We appreciate it!

There are many ways you can contribute:

- [Report bug or issues](https://github.com/Trackear/trackear/issues/new?assignees=&labels=&template=bug_report.md&title=)
- [Suggest new features](https://github.com/Trackear/trackear/issues/new?assignees=&labels=&template=feature_request.md&title=)
- Contribute with translations. Open a new issue so we can know what translation you will be working on. This way, we prevent multiple people from working on the same thing.
- Contribute with art/style improvement. Open a new issue to share it with us!
- Contribute with code changes. Fork the project, make your changes, and create a pull request.

Please, before doing so, make sure to check our CONTRIBUTING.md file and be sure
to create a new Github issue so we can be in sync and well organized.

## License
Please review our LICENSE.md file.
