SHELL := /bin/bash
.DEFAULT_GOAL := help

.PHONY: help
help: ## help message, list all command
	@echo -e "$$(grep -hE '^\S+.*:.*##' $(MAKEFILE_LIST) | sed -e 's/:.*##\s*/:/' -e 's/^\(.\+\):\(.*\)/\\x1b[36m\1\\x1b[m:\2/' | column -c2 -t -s :)"

.PHONY: up docker-run
up docker-run: docker-build ## docker-compose up
	touch dbinit.sql
	docker compose up --build

.PHONY: down docker-down
down docker-down: ## docker-compose down
	docker compose down -v

.PHONY: docker-build
docker-build: build ## docker-compose build
	docker compose build

.PHONY: build
build: ## Build the js code
	npm run build

.PHONY: dev
dev: ## Starts the api development server
	npm run dev

.PHONY: clean
clean: ## Clean build files
	rm -rf dist

.PHONY: lint
lint: ## run linter
	npm run lint	

.PHONY: init
init: install

.PHONY: install
install: ## Installs dependencies
	npm install	

.PHONY: shell-% sh-%
shell-% sh-%: ## Run a shell in a container
	docker compose exec $* sh

.PHONY: e2e-tests test
e2e-tests test: ## Start end2end tests (local running server is required)
	npx jest ./tests/api_e2e --verbose true

.PHONY: status
status: ## Send status request
	curl http://localhost:8080/status  -H 'Content-Type: application/json' 

.PHONY: send-api-req-local
send-api-req-local: ## Send a request to the local running server
	curl -X POST http://localhost:8080/events -H 'Content-Type: application/json' -H 'Authorization: Bearer dummy-cn389ncoiwuencr' --data-binary "@./fixtures/forwarder.json" 

.PHONY: send-analytics-req-local
send-analytics-req-local: ## Send analytics request to the local running server
	curl http://localhost:8080/analytics/v1/1/episodesAge -H 'Content-Type: application/json' -H 'Authorization: Bearer dummy-cn389ncoiwuencr'

.PHONY: send-api-req-prod
send-api-req-prod: ## Send request to production
	curl -X POST https://api.openpodcast.dev/connector  -H 'Content-Type: application/json' -H 'Authorization: Bearer dummy-cn389ncoiwuencr' --data-binary "@./fixtures/spotifyListeners.json" 

.PHONY: db-shell
db-shell: ## Opens the mysql shell inside the db container
	docker compose exec db bash -c 'mysql -uopenpodcast -popenpodcast openpodcast'
