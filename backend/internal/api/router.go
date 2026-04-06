package api

import (
	"github.com/Dschonas04/scrapebook/backend/internal/api/handlers"
	"github.com/Dschonas04/scrapebook/backend/internal/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func NewRouter(db *pgxpool.Pool, jwtSecret string) *gin.Engine {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false,
	}))

	authHandler := handlers.NewAuthHandler(db, jwtSecret)
	scrapbookHandler := handlers.NewScrapbookHandler(db)
	pageHandler := handlers.NewPageHandler(db)

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	auth := r.Group("/api/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
		auth.GET("/me", middleware.Auth(jwtSecret), authHandler.Me)
	}

	api := r.Group("/api", middleware.Auth(jwtSecret))
	{
		api.GET("/scrapbooks", scrapbookHandler.List)
		api.POST("/scrapbooks", scrapbookHandler.Create)
		api.GET("/scrapbooks/:id", scrapbookHandler.Get)
		api.DELETE("/scrapbooks/:id", scrapbookHandler.Delete)

		api.GET("/scrapbooks/:id/pages", pageHandler.List)
		api.POST("/scrapbooks/:id/pages", pageHandler.Create)
		api.DELETE("/scrapbooks/:id/pages/:pageId", pageHandler.Delete)
	}

	r.GET("/api/public/scrapbooks", scrapbookHandler.ListPublic)

	return r
}
