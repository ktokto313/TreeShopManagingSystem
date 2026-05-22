# Stage 1: Build stage
FROM gradle:jdk17-alpine AS build
WORKDIR /app
# Copy gradle and its config first for caching
# COPY .gradle .gradle
COPY gradle gradle
COPY gradlew .
RUN ./gradlew --version

# Download and cache dependency
COPY build.gradle settings.gradle ./
# Run gradlew in no daemon mode 
# because I can't get daemon caching to work
RUN ./gradlew dependencies --no-daemon

# Copy project files
COPY src src
# Build the JAR file (skipping tests for speed)
RUN ./gradlew bootJar --no-daemon

# Stage 2: Runtime stage
FROM eclipse-temurin:17-jdk-jammy 
WORKDIR /app
# Copy only the compiled JAR from the build stage
COPY --from=build /app/build/libs/*.jar app.jar
# Isolate running task from root perm
RUN adduser spring && adduser spring spring
USER spring:spring
# Expose the application port
EXPOSE 8080
# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]