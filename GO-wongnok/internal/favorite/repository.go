package favorite

import (
	"wongnok/internal/model"

	"gorm.io/gorm"
)

type IRepository interface {
	Get(userID string) (model.Favorites, error)
	GetByUser(foodRecipeQuery model.FoodRecipeQuery, userID string) (model.FoodRecipes, error)
	Create(favorite *model.Favorite) error
	Delete(id int) error
	GetByID(id int, claimsID string) (model.Favorite, error)
	GetDeleteByID(id int, claimsID string) (model.Favorite, error)
	Update(id int) error

	Count(UserID string, search string) (int64, error)
}

type Repository struct {
	DB *gorm.DB
}

func NewRepository(db *gorm.DB) IRepository {
	return &Repository{
		DB: db,
	}
}

func (repo Repository) Get(userID string) (model.Favorites, error) {
	var favorites model.Favorites

	if err := repo.DB.Where("user_id = ?", userID).Find(&favorites).Error; err != nil {
		return nil, err
	}

	return favorites, nil
}

// ดึงรายการสูตรอาหารที่ผู้ใช้กด Favorite โดยกรองเฉพาะรายการที่ยังไม่ถูกลบ (soft delete)
// - JOIN กับตาราง favorites และเช็ค fav.deleted_at IS NULL
// - Preload ความสัมพันธ์ที่จำเป็น โดย scope ตาม userID (เพื่อรู้ว่าผู้ใช้คนนี้ favorite/rating ไว้ไหม)
// - รองรับค้นหา + เรียง + แบ่งหน้า
func (repo Repository) GetByUser(query model.FoodRecipeQuery, userID string) (model.FoodRecipes, error) {
	var recipes = make(model.FoodRecipes, 0)
	offset := (query.Page - 1) * query.Limit
	db := repo.DB.
		Model(&model.FoodRecipe{}).
		Joins("JOIN favorites fav ON food_recipes.id = fav.food_recipe_id").
		Where("fav.user_id = ? AND fav.deleted_at IS NULL", userID).
		// Preload associations explicitly to avoid ambiguous/over-broad preloads
		Preload("Favorite", "user_id = ?", userID).
		Preload("Rating", "user_id = ?", userID).
		Preload("CookingDuration").
		Preload("Difficulty").
		Preload("User").
		Preload("Ratings")

	if query.Search != "" {
		db = db.Where("food_recipes.name LIKE ? OR food_recipes.description LIKE ?", "%"+query.Search+"%", "%"+query.Search+"%")
	}

	if err := db.Order("food_recipes.name asc").Limit(query.Limit).Offset(offset).Find(&recipes).Error; err != nil {
		return nil, err
	}
	return recipes, nil

}

func (repo Repository) Create(favorite *model.Favorite) error {
	if err := repo.DB.Create(favorite).Error; err != nil {
		return err
	}

	return nil
}

func (repo Repository) GetByID(id int, claimsID string) (model.Favorite, error) {

	var favorite model.Favorite
	if err := repo.DB.Where("food_recipe_id = ? AND user_id = ?", id, claimsID).First(&favorite).Error; err != nil {
		return model.Favorite{}, err
	}
	return favorite, nil
}

func (repo Repository) GetDeleteByID(id int, claimsID string) (model.Favorite, error) {

	var favorite model.Favorite
	if err := repo.DB.Unscoped().Where("food_recipe_id = ? AND user_id = ?", id, claimsID).First(&favorite).Error; err != nil {
		return model.Favorite{}, err
	}
	return favorite, nil

}

func (repo Repository) Delete(id int) error {
	return repo.DB.Delete(&model.Favorite{}, id).Error
}

func (repo Repository) Update(id int) error {

	var favorite model.Favorite
	// ดึงข้อมูลเดิมมาก่อน (optional)
	if err := repo.DB.Unscoped().First(&favorite, id).Error; err != nil {
		return err
	}

	// อัปเดต deleted_at ให้เป็น nil
	if err := repo.DB.Unscoped().Model(&favorite).Where("id = ?", id).Update("deleted_at", nil).Error; err != nil {
		return err
	}

	return repo.DB.First(&favorite, favorite.ID).Error
}

// นับจำนวนสูตรอาหารที่อยู่ในรายการโปรดของผู้ใช้ (ใช้ทำ pagination)
func (repo Repository) Count(UserID string, search string) (int64, error) {
	var count int64

	db := repo.DB.Model(&model.FoodRecipe{}).
		Joins("JOIN favorites fav ON food_recipes.id = fav.food_recipe_id").
		Where("fav.user_id = ? AND fav.deleted_at IS NULL", UserID)

	if search != "" {
		db = db.Where("food_recipes.name LIKE ? OR food_recipes.description LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if err := db.Count(&count).Error; err != nil {
		return 0, err
	}

	return count, nil
}
