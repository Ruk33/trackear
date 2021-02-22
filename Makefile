.PHONY: dev_server dev_assets assets

dev_server : export RAILS_ENV = development
dev_server : export NODE_ENV = development
dev_server :
	@echo "🚀 Starting rails server in localhost:3000"
	-@$(RM) ./tmp/pids/server.pid
	rails s

dev_assets : export RAILS_ENV = development
dev_assets : export NODE_ENV = development
dev_assets :
	@echo "⌚ Starting watch to build assets on modifications"
	node esbuild.js

assets : export RAILS_ENV = production
assets : export NODE_ENV = production
assets :
	@echo "🔨 Building assets for production"
	node esbuild.js
	bundle exec rake assets:precompile
