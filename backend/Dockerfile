# Build stage
FROM golang:1.27.4-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /server ./cmd/server

# Runtime stage
FROM alpine:3.24
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /app
COPY --from=builder /server /app/server
EXPOSE 8080
CMD ["/app/server"]
