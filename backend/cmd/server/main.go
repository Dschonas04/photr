package main

import (
	"log"
	"time"

	"github.com/Dschonas04/photr/backend/config"
	"github.com/Dschonas04/photr/backend/internal/api"
	"github.com/Dschonas04/photr/backend/internal/db"
)

func main() {
	cfg := config.Load()

	var pool, err = db.NewPool(cfg.DSN())
	for i := 0; err != nil && i < 10; i++ {
		log.Printf("waiting for database... (%d/10): %v", i+1, err)
		time.Sleep(3 * time.Second)
		pool, err = db.NewPool(cfg.DSN())
	}
	if err != nil {
		log.Fatalf("could not connect to database: %v", err)
	}
	defer pool.Close()

	if err := db.Migrate(pool); err != nil {
		log.Fatalf("could not run migrations: %v", err)
	}
	log.Println("database migrations applied")

	router := api.NewRouter(pool, cfg.JWTSecret)
	addr := ":" + cfg.ServerPort
	log.Printf("server listening on %s", addr)
	if err := router.Run(addr); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
