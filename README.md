# TreeShopManagingSystem
An FPTU SWP391 project to build a shop managing system which sell trees and additional items

## Tech Stack
* **Frontend**: React 19, React Router DOM, Vite
* **Backend**: Java 17, Spring Boot 4.x, Gradle, Java-JWT
* **Database**: PostgreSQL (with pgAdmin4)
* **Infrastructure**: Docker & Docker Compose, Makefile

## Project Structure
* `Frontend/`: The React web application.
* `Backend/`: The Java Spring Boot backend.
* `greenshop_2.sql`: Database initialize script

## Environment Configuration

The project uses one primary files for configurations and environment variables:

### 1. `.env`
This file configures the Spring Boot application and JWT properties:
```env
POSTGRES_USER: sa
POSTGRES_DB: app
POSTGRES_PASSWORD: example
PGADMIN_DEFAULT_EMAIL: a@a.a
PGADMIN_DEFAULT_PASSWORD: example

SERVER_ADDRESS: 0.0.0.0
SERVER_PORT: 8081
JWT_COOKIE_NAME: Auth
JWT_LIFETIME: 86400
JWT_ISSUER: LKT
JWT_SECRET: a-string-for-testing
```

## Getting Started

### Prerequisites
#### Normal deploy
* [Docker and Docker Compose](https://www.docker.com/)
* Make (optional)
#### Additional requirement for dev build
* Java 17
* Node 22 (optional)

### Running the Application

Run:

```bash
make run
```
or 

```bash
docker compose up --build -d
```
without make


Once running, the application services will be exposed at:
* **Frontend**: [http://localhost:4173](http://localhost:4173)
* **pgAdmin**: [http://localhost:80](http://localhost:80)
* **Backend API**: running within the docker container
* **PostgreSQL Database**: running within the docker container

### Building with dev configuration
Running in docker:
```bash
make dev
```

Running frontend and backend manually
```bash
cd Backend
gradlew.bat bootRun
cd ../Frontend
npm install
npm run dev
```