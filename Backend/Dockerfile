# Stage 1: Build stage
FROM gradle:jdk17-alpine AS build
WORKDIR /app
# Copy gradle and its config first for caching
# COPY .gradle .gradle
COPY gradle gradle
COPY gradlew .
RUN ./gradlew --version

# Copy project files
COPY build.gradle settings.gradle ./
COPY src src
# Build the JAR file (skipping tests for speed)
RUN --mount=type=cache,target=/home/gradle/.gradle ./gradlew bootJar --no-daemon

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
# Run the application with timezone set as JVM arg to prevent PostgreSQL rejecting "Asia/Saigon" on Windows
ENTRYPOINT ["java", "-Duser.timezone=Asia/Ho_Chi_Minh", "-jar", "app.jar"]