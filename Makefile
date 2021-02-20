.PHONY: dev_server dev_assets

dev_server :
	@echo "🚀 Starting rails server in localhost:3000"
	-@$(RM) ./tmp/pids/server.pid
	rails s

dev_assets :
	@echo "⌚ Starting watch to build assets on modifications"
	ruby bin/webpack-dev-server
