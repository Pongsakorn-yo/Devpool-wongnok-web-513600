package foodrecipe

import (
	"fmt"
	"wongnok/internal/model"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type IRepository interface {
	Create(recipe *model.FoodRecipe) error
	Get(foodRecipeQuery model.FoodRecipeQuery, claimsID string) (model.FoodRecipes, error)
	Count(query model.FoodRecipeQuery) (int64, error)
	GetByID(id int, claimsID string) (model.FoodRecipe, error)
	Update(recipe *model.FoodRecipe) error
	Delete(id int) error
}

type Repository struct {
	DB *gorm.DB
}

func NewRepository(db *gorm.DB) IRepository {
	return &Repository{
		DB: db,
	}
}

func (repo Repository) Create(recipe *model.FoodRecipe) error {
	return repo.DB.Preload(clause.Associations).Create(recipe).First(&recipe).Error
}

// ดึงรายการสูตรอาหารทั้งหมด
// - Preload Favorite/Rating แบบ scope ด้วย claimsID เพื่อรู้สถานะของผู้ใช้ปัจจุบัน
// - รองรับค้นหาและแบ่งหน้า
func (repo Repository) Get(query model.FoodRecipeQuery, claimsID string) (model.FoodRecipes, error) {
	var recipes = make(model.FoodRecipes, 0)

	offset := (query.Page - 1) * query.Limit
	db := repo.DB.Preload("Favorite", "user_id = ?", claimsID)
	db = db.Preload("Rating", "user_id = ?", claimsID)
	db = db.Preload("CookingDuration")
	db = db.Preload("Difficulty")
	db = db.Preload("User")
	db = db.Preload("Ratings")

	if query.Search != "" {
		db = db.Where("name LIKE ?", "%"+query.Search+"%").Or("description LIKE ?", "%"+query.Search+"%")
	}

	if err := db.Order("name asc").Limit(query.Limit).Offset(offset).Find(&recipes).Error; err != nil {
		return nil, err
	}

	return recipes, nil
}

func (repo Repository) Count(query model.FoodRecipeQuery) (int64, error) {
	var count int64

	db := repo.DB.Model(&model.FoodRecipes{})

	if query.Search != "" {
		db = db.Where("name LIKE ?", "%"+query.Search+"%").Or("description LIKE ?", "%"+query.Search+"%")
	}

	if err := db.Count(&count).Error; err != nil {
		return 0, err
	}

	return count, nil
}

// ดึงรายละเอียดสูตรอาหารตาม id (พร้อม preload ความสัมพันธ์)
// - ใส่ Favorite/Rating ของผู้ใช้ปัจจุบันมาด้วย (จาก claimsID)
func (repo Repository) GetByID(id int, claimsID string) (model.FoodRecipe, error) {
	var recipe model.FoodRecipe
	fmt.Println("FGDD", claimsID)
	if err := repo.DB.Preload("Favorite", "user_id = ?", claimsID).Preload("Rating", "user_id = ?", claimsID).Preload("CookingDuration").Preload("Difficulty").Preload("Difficulty").Preload("User").Preload("Ratings").First(&recipe, id).Error; err != nil {
		return model.FoodRecipe{}, err
	}

	return recipe, nil
}

func (repo Repository) Update(recipe *model.FoodRecipe) error {
	// update
	if err := repo.DB.Model(&recipe).Where("id = ?", recipe.ID).Updates(recipe).Error; err != nil {
		return err
	}

	return repo.DB.Preload(clause.Associations).First(&recipe, recipe.ID).Error
}

func (repo Repository) Delete(id int) error {
	return repo.DB.Delete(&model.FoodRecipes{}, id).Error
}
