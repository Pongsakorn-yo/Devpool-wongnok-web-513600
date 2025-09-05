package user

import (
	"net/http"
	"wongnok/internal/helper"
	"wongnok/internal/model"
	"wongnok/internal/model/dto"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type IHandler interface {
	GetRecipes(ctx *gin.Context)
	Update(ctx *gin.Context)
	Create(ctx *gin.Context)
	Get(ctx *gin.Context)
}

type Handler struct {
	Service IService
}

func NewHandler(db *gorm.DB) *Handler {
	return &Handler{
		Service: NewService(db),
	}
}

// GetRecipes godoc
// @Summary Get a food recipe by user ID
// @Description Get a food recipe by user ID
// @Tags users
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Success 200 {object} dto.UserResponse
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/v1/users/{id}/food-recipes [get]
// หมายเหตุ: ถ้า client ส่ง id เป็น "self" service จะตีความจาก claims (ผู้ใช้ที่ login)
func (handler Handler) GetRecipes(ctx *gin.Context) {
	userID := ctx.Param("id")

	claims, err := helper.DecodeClaims(ctx)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"message": err.Error()})
		return
	}

	recipes, err := handler.Service.GetRecipes(userID, claims)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, recipes.ToResponse(int64(len(recipes))))
}

// GetRecipes godoc
// @Summary Get a food recipe by user ID
// @Description Get a food recipe by user ID
// @Tags users
// @Accept json
// @Produce json
// @Success 200 {object} dto.UserResponse
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/v1/users/ [get]
// คืนข้อมูลผู้ใช้ปัจจุบันจาก JWT claims
func (handler Handler) Get(ctx *gin.Context) {

	claims, err := helper.DecodeClaims(ctx)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"message": err.Error()})
		return
	}

	user, err := handler.Service.GetByID(claims)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, user.ToResponse())
}

// Create godoc
// @Summary Create a User
// @Description Create a user
// @Tags users
// @Accept json
// @Produce json
// @Success 201 {object} dto.UserResponse
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/v1/users/ [post]
// สร้างผู้ใช้ตาม claims (ใช้เป็น upsert flow คู่กับ frontend เมื่อ user ใหม่เพิ่ง login ครั้งแรก)
func (handler Handler) Create(ctx *gin.Context) {
	claims, err := helper.DecodeClaims(ctx)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"message": err.Error()})
		return
	}

	user, err := handler.Service.Create(claims)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, user.ToResponse())
}

// Create godoc
// @Summary Update a User
// @Description Upadate a user
// @Tags users
// @Accept json
// @Produce json
// @Param recipe body dto.UserRequest true "User data"
// @Success 201 {object} dto.UserResponse
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/v1/users/ [put]
// อัปเดตข้อมูลผู้ใช้ (nickname, imageUrl)
func (handler Handler) Update(ctx *gin.Context) {
	claims, err := helper.DecodeClaims(ctx)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"message": err.Error()})
		return
	}
	var request dto.UserRequest

	if err := ctx.BindJSON(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	userStruct := model.User{}.FromRequest(request, claims)
	user, err := handler.Service.Update(userStruct)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, user.ToResponse())
}
