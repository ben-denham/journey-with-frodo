docker-build:
	docker-compose build
run: docker-build
	docker-compose up

deps:
	docker-compose run --rm frontend npm install
build-site:
	docker-compose run --rm frontend npm run build
bash:
	docker-compose run --rm frontend bash
