package favorite

import (
	"errors"
	"net/http"
	"strconv"
	"wongnok/internal/global"
	"wongnok/internal/helper"
	"wongnok/internal/model"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

type IHandler interface {
	Get(ctx *gin.Context)
	GetByUser(ctx *gin.Context)
	Create(ctx *gin.Context)
	Delete(ctx *gin.Context)
	Update(ctx *gin.Context)
}

type Handler struct {
	Service IService
}

func NewHandler(db *gorm.DB) *Handler {
	return &Handler{
		Service: NewService(db),
	}
}

// Get godoc
// @Summary Get favorites
// @Description Get all favorites
// @Tags favorite
// @Param id path string true "id"
// @Accept json
// @Produce json
// @Success 200 {object} dto.FavoriteResponse
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/v1/food-recipes/{id}/favorites [get]
func (handler Handler) Get(ctx *gin.Context) {
	var id string

	pathParam := ctx.Param("id")
	if pathParam != "" {
		id = pathParam
	}
	favorite, err := handler.Service.Get(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			ctx.JSON(http.StatusInternalServerError, gin.H{"message": "favorite not found"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, favorite.ToResponse())
}

// Get godoc
// @Summary GetByuser favorites
// @Description Get all favorites
// @Tags favorite
// @Accept json
// @Produce json
// @Param page query int true "Page number" (default 1)
// @Param limit query int true "Items per page" (default 10)
// @Param search query string false "Search term"
// @Success 200 {object} dto.FavoriteResponse
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/v1/food-recipes/favorites [get]
func (handler Handler) GetByUser(ctx *gin.Context) {

	claims, err := helper.DecodeClaims(ctx)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"message": err.Error()})
		return
	}

	var foodRecipeQuery model.FoodRecipeQuery
	if err := ctx.ShouldBindQuery(&foodRecipeQuery); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	foodRecipes, total, err := handler.Service.GetByUser(foodRecipeQuery, claims)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			ctx.JSON(http.StatusInternalServerError, gin.H{"message": "favorite not found"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, foodRecipes.ToResponse(total))
}

// Create godoc
// @Summary Create a favorite
// @Description Create a new favorite for a food recipe by userID
// @Tags favorite
// @Accept json
// @Produce json
// @Param id path string true "id"
// @Success 201 {object} dto.FavoriteResponse
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/v1/food-recipes/{id}/favorites [post]
func (handler Handler) Create(ctx *gin.Context) {
	var id int
	pathParam := ctx.Param("id")
	if pathParam != "" {
		if parsed, err := strconv.Atoi(pathParam); err == nil && parsed > 0 {
			id = parsed
		}
	}

	claims, err := helper.DecodeClaims(ctx)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"message": err.Error()})
		return
	}
	favorite, err := handler.Service.Create(id, claims)

	if err != nil {
		statusCode := http.StatusInternalServerError
		if errors.As(err, &validator.ValidationErrors{}) {
			statusCode = http.StatusBadRequest
		}

		ctx.JSON(statusCode, gin.H{"message": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, favorite.ToResponse())
}

// Delete godoc
// @Summary Create a favorite
// @Description delete favorite by fooderecipeid
// @Tags favorite
// @Accept json
// @Produce json
// @Param id path string true "id"
// @Success 201 {object} dto.FavoriteResponse
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/v1/food-recipes/{id}/favorites [delete]
func (handler Handler) Delete(ctx *gin.Context) {
	claims, err := helper.DecodeClaims(ctx)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"message": err.Error()})
		return
	}

	var id int

	pathParam := ctx.Param("id")
	if pathParam != "" {
		if parsed, err := strconv.Atoi(pathParam); err == nil && parsed > 0 {
			id = parsed
		}
	}

	if err := handler.Service.Delete(id, claims); err != nil {
		statusCode := http.StatusInternalServerError

		if errors.Is(err, global.ErrForbidden) {
			statusCode = http.StatusForbidden
		}

		ctx.JSON(statusCode, gin.H{"message": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Recipe deleted successfully"})
}
