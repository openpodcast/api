.DEFAULT_GOAL := help

.PHONY: help
help: ## help message, list all command
	@echo -e "$$(grep -hE '^\S+:.*##' $(MAKEFILE_LIST) | sed -e 's/:.*##\s*/:/' -e 's/^\(.\+\):\(.*\)/\\x1b[36m\1\\x1b[m:\2/' | column -c2 -t -s :)"

.PHONY: dev
dev: ## Starts the development server
	yarn dev

.PHONY: lint
lint: ## run linter
	yarn lint	

.PHONY: init
init: ## Installs dependencies
	yarn install

.PHONY: e2e-tests
e2e-tests: ## Start end2end tests (local running server is required)
	yarn jest ./tests/api_e2e --verbose true

.PHONY: send-api-req-local
send-api-req-local: ## Send a request to the local running server
	curl -X POST http://localhost:8080/events -H 'Content-Type: application/json' -H 'Authorization: Bearer cn389ncoiwuencr' --data-binary "@./fixtures/forwarder.json" 

.PHONY: send-api-req-prod
send-api-req-prod: ## Send request to production
	curl -X POST https://api.openpodcast.dev/connector  -H 'Content-Type: application/json' -H 'Authorization: Bearer cn389ncoiwuencr' --data-binary "@./fixtures/spotifyListeners.json" 