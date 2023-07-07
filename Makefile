SHELL := /bin/bash
.DEFAULT_GOAL := help

.PHONY: help
help: ## help message, list all command
	@echo -e "$$(grep -hE '^\S+.*:.*##' $(MAKEFILE_LIST) | sed -e 's/:.*##\s*/:/' -e 's/^\(.\+\):\(.*\)/\\x1b[36m\1\\x1b[m:\2/' | column -c2 -t -s :)"

.PHONY: up docker-run
up docker-run: docker-build ## docker-compose up
	touch dbinit.sql
	docker compose up --build

.PHONY: up-db
up-db: ## docker-compose up db
	touch dbinit.sql
	docker compose up db

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
	set -a && source env.local.test && set +a && npm run dev

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

.PHONY: test
test: ## Run tests
	npx jest ./src --verbose true

.PHONY: e2e-tests
e2e-tests: ## Start end2end tests
	@make up &

	@# wait until server is ready and the connection to the db is ready
	@- while ! curl -s -f -LI http://localhost:8080/health >> /dev/null; do echo "waiting until server is ready for tests..." && sleep 3; done

	npx jest ./tests/api_e2e --verbose true

	@docker compose down

	@echo "Done - Some important information for debugging:"
	@echo "  - If the tests fail, consider to refresh the db by running 'make down' first"
	@echo "  - To have data for spotify, apple, and anchor, use podcast_id 3 for the tests"

.PHONY: status
status: ## Send status request
	curl http://localhost:8080/status  -H 'Content-Type: application/json' 

.PHONY: send-api-req-local
send-api-req-local: ## Send a request to the local running server
	curl -X POST http://localhost:8080/connector -H 'Content-Type: application/json' -H 'Authorization: Bearer dummy-cn389ncoiwuencr' --data-binary "@./fixtures/spotifyPerformance.json" 

.PHONY: send-analytics-%
send-analytics-%: ## Send analytics request to the local running server
	curl http://localhost:8080/analytics/v1/3/$*?start=$$(date -d "2 months ago" +%Y-%m-%d)\&end=$$(date -d "2 days ago" +%Y-%m-%d) -H 'Content-Type: application/json' -H 'Authorization: Bearer dummy-cn389ncoiwuencr'

.PHONY: send-api-req-prod
send-api-req-prod: ## Send request to production
	curl -X POST https://api.openpodcast.dev/connector  -H 'Content-Type: application/json' -H 'Authorization: Bearer dummy-cn389ncoiwuencr' --data-binary "@./fixtures/spotifyPerformance.json" 

.PHONY: db-shell
db-shell: ## Opens the mysql shell inside the db container
	docker compose exec db bash -c 'mysql -uopenpodcast -popenpodcast openpodcast'
