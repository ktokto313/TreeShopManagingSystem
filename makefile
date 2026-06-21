build:
	cd ./Backend && \
	rm -f ./build/libs/*.jar && \
	./gradlew bootJar --build-cache --configuration-cache --parallel

dev: build
	docker compose -f compose_dev.yml up --build -d

run:
	docker compose up --build -d
