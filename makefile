build:
	cd ./ErrorTicketManager && \
	rm -f ./build/libs/*.jar && \
	./gradlew bootJar

# run: build
run:
	docker compose up --build -d
