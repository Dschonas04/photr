package handlers

import (
	"context"
	"net/http"
	"strconv"

	"github.com/Dschonas04/photr/backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PageHandler struct {
	db *pgxpool.Pool
}

func NewPageHandler(db *pgxpool.Pool) *PageHandler {
	return &PageHandler{db: db}
}

func (h *PageHandler) List(c *gin.Context) {
	scrapbookID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid scrapbook id"})
		return
	}

	rows, err := h.db.Query(
		context.Background(),
		`SELECT id, scrapbook_id, title, content, image_url, page_order, created_at, updated_at
		 FROM pages WHERE scrapbook_id = $1 ORDER BY page_order ASC`,
		scrapbookID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not fetch pages"})
		return
	}
	defer rows.Close()

	var pages []models.Page
	for rows.Next() {
		var p models.Page
		if err := rows.Scan(&p.ID, &p.ScrapbookID, &p.Title, &p.Content, &p.ImageURL, &p.PageOrder, &p.CreatedAt, &p.UpdatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not scan row"})
			return
		}
		pages = append(pages, p)
	}
	if pages == nil {
		pages = []models.Page{}
	}
	c.JSON(http.StatusOK, pages)
}

func (h *PageHandler) Create(c *gin.Context) {
	scrapbookID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid scrapbook id"})
		return
	}

	userID := c.GetInt("user_id")
	var ownerID int
	err = h.db.QueryRow(
		context.Background(),
		`SELECT user_id FROM scrapbooks WHERE id = $1`,
		scrapbookID,
	).Scan(&ownerID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "scrapbook not found"})
		return
	}
	if ownerID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "access denied"})
		return
	}

	var req models.CreatePageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var p models.Page
	err = h.db.QueryRow(
		context.Background(),
		`INSERT INTO pages (scrapbook_id, title, content, image_url, page_order)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id, scrapbook_id, title, content, image_url, page_order, created_at, updated_at`,
		scrapbookID, req.Title, req.Content, req.ImageURL, req.PageOrder,
	).Scan(&p.ID, &p.ScrapbookID, &p.Title, &p.Content, &p.ImageURL, &p.PageOrder, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create page"})
		return
	}

	c.JSON(http.StatusCreated, p)
}

func (h *PageHandler) Delete(c *gin.Context) {
	scrapbookID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid scrapbook id"})
		return
	}
	pageID, err := strconv.Atoi(c.Param("pageId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid page id"})
		return
	}

	userID := c.GetInt("user_id")
	var ownerID int
	err = h.db.QueryRow(
		context.Background(),
		`SELECT user_id FROM scrapbooks WHERE id = $1`,
		scrapbookID,
	).Scan(&ownerID)
	if err != nil || ownerID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "access denied"})
		return
	}

	tag, err := h.db.Exec(
		context.Background(),
		`DELETE FROM pages WHERE id = $1 AND scrapbook_id = $2`,
		pageID, scrapbookID,
	)
	if err != nil || tag.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "page not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}
