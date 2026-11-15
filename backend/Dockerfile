# Multi-stage Docker build for Pure Core Java Backend
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app
COPY . ./

# Find all Java source files and compile with pure javac
RUN find src -name "*.java" > sources.txt && \
    mkdir -p out && \
    javac -cp "lib/*" -d out @sources.txt

# Lightweight runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=builder /app/out ./out
COPY --from=builder /app/lib ./lib

ENV PORT=8080
EXPOSE 8080

CMD ["java", "-cp", "out:lib/*", "com.travel.Main"]
