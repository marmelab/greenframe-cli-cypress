default: help

PACKAGE_VERSION :=  $(shell node -p -e "require('./package.json').version")
SHORT_HASH := $(shell git rev-parse --short HEAD)

BUILD_TARGETS := linux-x64,linux-arm64,win32-x64,darwin-x64,darwin-arm64
DEPLOY_TARGETS := $(BUILD_TARGETS),wsl-x64

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | gawk 'match($$0, /(makefile:)?(.*):.*?## (.*)/, a) {printf "\033[36m%-30s\033[0m %s\n", a[2], a[3]}'


install: ## Install dependencies
	yarn install

clean-dist: ## Remove dist folder
	rm -rf ./dist

compile: clean-dist ## Compile the project
	yarn build

typecheck: ## Typecheck the project
	yarn typecheck

build: clean-dist ## Create tarballs of CLI
	yarn build && yarn set version classic && npx oclif pack tarballs -t $(BUILD_TARGETS)
	$(MAKE) generate-wsl-cli

rename-tarballs: ## Rename tarballs
	for target in $(shell echo $(DEPLOY_TARGETS) | tr ',' ' '); do \
		mv ./dist/greenframe-v$(PACKAGE_VERSION)-$(SHORT_HASH)-$$target.tar.gz ./dist/greenframe-$$target.tar.gz; \
		mv ./dist/greenframe-v$(PACKAGE_VERSION)-$(SHORT_HASH)-$$target.tar.xz ./dist/greenframe-$$target.tar.xz; \
	done

generate-wsl-cli: ## Generate WSL version of CLI
	cp ./dist/greenframe-v$(PACKAGE_VERSION)-$(SHORT_HASH)-linux-x64.tar.gz ./dist/greenframe-v$(PACKAGE_VERSION)-$(SHORT_HASH)-wsl-x64.tar.gz
	cp ./dist/greenframe-v$(PACKAGE_VERSION)-$(SHORT_HASH)-linux-x64.tar.xz ./dist/greenframe-v$(PACKAGE_VERSION)-$(SHORT_HASH)-wsl-x64.tar.xz
	${MAKE} rename-tarballs

test: test-unit test-e2e ## Launch all tests

test-unit: ## Launch unit test
	yarn test-unit

test-e2e: ## Launch e2e test
	yarn build
	yarn test-e2e

test-watch: ## Launch unit test in watch mode
	yarn test-watch

lint: ## Launch lint
	yarn lint
