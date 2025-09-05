package user

import (
	"wongnok/internal/model"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type IRepository interface {
	GetByID(id string) (model.User, error)
	Upsert(user *model.User) error
	Create(user *model.User) (model.User, error)
	Update(user *model.User) (model.User, error)
	GetRecipes(userID string) (model.FoodRecipes, error)
}

type Repository struct {
	DB *gorm.DB
}

func NewRepository(db *gorm.DB) IRepository {
	return &Repository{
		DB: db,
	}
}

func (repo Repository) GetByID(id string) (model.User, error) {
	var user model.User

	if err := repo.DB.First(&user, "id = ?", id).Error; err != nil {
		return user, err
	}

	return user, nil
}

// Upsert: มีอยู่แล้วก็อัปเดต ไม่มีก็สร้าง (สะดวกสำหรับ flow ผู้ใช้ใหม่)
func (repo Repository) Upsert(user *model.User) error {
	return repo.DB.Save(user).Error
}

// ดึงสูตรอาหารทั้งหมดของผู้ใช้คนหนึ่ง (ใช้ทำหน้า "สูตรของฉัน")
func (repo Repository) GetRecipes(userID string) (model.FoodRecipes, error) {
	var recipes model.FoodRecipes

	if err := repo.DB.Preload(clause.Associations).Find(&recipes, "user_id = ?", userID).Error; err != nil {
		return model.FoodRecipes{}, err
	}

	return recipes, nil
}

func (repo Repository) Create(user *model.User) (model.User, error) {
	if err := repo.DB.Create(user).Error; err != nil {
		return model.User{}, err
	}
	return *user, nil
}

func (repo Repository) Update(user *model.User) (model.User, error) {
	if err := repo.DB.Save(user).Error; err != nil {
		return model.User{}, err
	}
	return *user, nil
}
