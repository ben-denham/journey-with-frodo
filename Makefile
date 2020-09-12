docker-build:
	docker-compose build
run: docker-build
	docker-compose up

deps:
	docker-compose run --rm frontend npm install
deploy:
	npm run deploy
bash:
	docker-compose run --rm frontend bash
