package handlers

import (
	"context"
	"net/http"
	"strconv"

	"github.com/Dschonas04/scrapebook/backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ScrapbookHandler struct {
	db *pgxpool.Pool
}

func NewScrapbookHandler(db *pgxpool.Pool) *ScrapbookHandler {
	return &ScrapbookHandler{db: db}
}

func (h *ScrapbookHandler) List(c *gin.Context) {
	userID := c.GetInt("user_id")

	rows, err := h.db.Query(
		context.Background(),
		`SELECT id, user_id, title, description, cover_color, is_public, created_at, updated_at
		 FROM scrapbooks WHERE user_id = $1 ORDER BY created_at DESC`,
		userID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not fetch scrapbooks"})
		return
	}
	defer rows.Close()

	var scrapbooks []models.Scrapbook
	for rows.Next() {
		var s models.Scrapbook
		if err := rows.Scan(&s.ID, &s.UserID, &s.Title, &s.Description, &s.CoverColor, &s.IsPublic, &s.CreatedAt, &s.UpdatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not scan row"})
			return
		}
		scrapbooks = append(scrapbooks, s)
	}
	if scrapbooks == nil {
		scrapbooks = []models.Scrapbook{}
	}
	c.JSON(http.StatusOK, scrapbooks)
}

func (h *ScrapbookHandler) ListPublic(c *gin.Context) {
	rows, err := h.db.Query(
		context.Background(),
		`SELECT id, user_id, title, description, cover_color, is_public, created_at, updated_at
		 FROM scrapbooks WHERE is_public = TRUE ORDER BY created_at DESC LIMIT 50`,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not fetch scrapbooks"})
		return
	}
	defer rows.Close()

	var scrapbooks []models.Scrapbook
	for rows.Next() {
		var s models.Scrapbook
		if err := rows.Scan(&s.ID, &s.UserID, &s.Title, &s.Description, &s.CoverColor, &s.IsPublic, &s.CreatedAt, &s.UpdatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not scan row"})
			return
		}
		scrapbooks = append(scrapbooks, s)
	}
	if scrapbooks == nil {
		scrapbooks = []models.Scrapbook{}
	}
	c.JSON(http.StatusOK, scrapbooks)
}

func (h *ScrapbookHandler) Create(c *gin.Context) {
	userID := c.GetInt("user_id")

	var req models.CreateScrapbookRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.CoverColor == "" {
		req.CoverColor = "#6366f1"
	}

	var s models.Scrapbook
	err := h.db.QueryRow(
		context.Background(),
		`INSERT INTO scrapbooks (user_id, title, description, cover_color, is_public)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id, user_id, title, description, cover_color, is_public, created_at, updated_at`,
		userID, req.Title, req.Description, req.CoverColor, req.IsPublic,
	).Scan(&s.ID, &s.UserID, &s.Title, &s.Description, &s.CoverColor, &s.IsPublic, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create scrapbook"})
		return
	}

	c.JSON(http.StatusCreated, s)
}

func (h *ScrapbookHandler) Get(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var s models.Scrapbook
	err = h.db.QueryRow(
		context.Background(),
		`SELECT id, user_id, title, description, cover_color, is_public, created_at, updated_at
		 FROM scrapbooks WHERE id = $1`,
		id,
	).Scan(&s.ID, &s.UserID, &s.Title, &s.Description, &s.CoverColor, &s.IsPublic, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "scrapbook not found"})
		return
	}

	userID := c.GetInt("user_id")
	if !s.IsPublic && s.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "access denied"})
		return
	}

	c.JSON(http.StatusOK, s)
}

func (h *ScrapbookHandler) Delete(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	userID := c.GetInt("user_id")

	tag, err := h.db.Exec(
		context.Background(),
		`DELETE FROM scrapbooks WHERE id = $1 AND user_id = $2`,
		id, userID,
	)
	if err != nil || tag.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "scrapbook not found or access denied"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}
