.DEFAULT_GOAL := help

.PHONY: help
help: ## Outputs the help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.PHONY: dev
dev: ## Starts the development server
	yarn dev

.PHONY: lint
lint: ## Installs dependencies
	yarn lint	

.PHONY: init
init: ## Installs dependencies
	yarn install

.PHONY: e2e-tests
e2e-tests: ## Installs dependencies
	yarn jest ./tests/api_e2e --verbose true

.PHONY: send-api-req-local
send-api-req-local: ## Installs dependencies
	curl -X POST http://localhost:8080/events -H 'Content-Type: application/json' -H 'Authorization: Bearer cn389ncoiwuencr' --data-binary "@./fixtures/forwarder.json" 