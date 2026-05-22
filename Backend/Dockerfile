# Stage 1: Build stage
FROM gradle:jdk17-alpine AS build
WORKDIR /app
# Copy project files
COPY . .
# Build the JAR file (skipping tests for speed)
RUN ./gradlew bootJar

# Stage 2: Runtime stage
FROM openjdk:17-jdk-slim
WORKDIR /app
# Copy only the compiled JAR from the build stage
COPY --from=build /app/build/libs/*.jar app.jar
# Expose the application port
EXPOSE 8080
# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]