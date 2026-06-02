build:
	cd ./Backend && \
	rm -f ./build/libs/*.jar && \
	./gradlew bootJar --configuration-cache

dev: build
	docker compose -f compose_dev.yml up --build -d

run:
	docker compose up --build -d
