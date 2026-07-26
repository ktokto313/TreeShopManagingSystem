# TreeShopManagingSystem
An FPTU SWP391 project to build a shop managing system which sell trees and additional items

## Tech Stack
* **Frontend**: React 19, TailwindCSS, React Router DOM, Vite
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


Note that empty value should be filled for the corresponding module to work correctly
```env
POSTGRES_USER=sa
POSTGRES_PASSWORD=example
POSTGRES_DB=app

SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/app
SERVER_PORT=8080

PGADMIN_DEFAULT_EMAIL=admin@admin.com
PGADMIN_DEFAULT_PASSWORD=admin

JWT_SECRET=a-string-for-testing
JWT_ISSUER=a
JWT_LIFETIME=86400
JWT_COOKIE_NAME=hihi
JWT_COOKIE_SECURE=false

#Google Client Id taken from google cloud console
GOOGLE_CLIENT-ID=

#Gmail OTP
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
#Gmail address
SPRING_MAIL_USERNAME=
SPRING_MAIL_PASSWORD=
SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH=true
SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE=true

#VietQR configuration
CHECKOUT_BANK_ID=MB
CHECKOUT_BANK_ACCOUNT_NO=
CHECKOUT_BANK_ACCOUNT_NAME=
CHECKOUT_TRANSFER_PREFIX=TS
CHECKOUT_QR_TEMPLATE=compact2

# Viettel Post configuration
VIETTELPOST_USERNAME=
VIETTELPOST_PASSWORD=
VIETTELPOST_BASE_URL=https://partner.viettelpost.vn
VIETTELPOST_ENABLED=true
VIETTELPOST_SENDER_PROVINCE_ID=1
VIETTELPOST_SENDER_DISTRICT_ID=2
```

## Getting Started

### Prerequisites
#### Normal deploy
* [Docker and Docker Compose](https://www.docker.com/)
* Make (optional)
#### Additional requirement for dev build
* Java 17
* Node 22

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
* **Frontend**: [http://localhost:3000](http://localhost:3000)
* **pgAdmin**: [http://localhost:81](http://localhost:81)
* **Backend API**: running within the docker container
* **PostgreSQL Database**: running within the docker container

### Building with dev configuration

**Disclaimer: This is taken from the configuration we usually run locally, there could be something missing, run at your own discretion**

Running in docker:
```bash
make dev
```

Running frontend and backend manually:

*Database and dbms not included*

```bash
cd Backend
gradlew.bat bootRun
cd ../Frontend
npm install
npm run dev
```
