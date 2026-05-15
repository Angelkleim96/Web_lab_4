// ======================== ОБЪЕКТНО-ОРИЕНТИРОВАННАЯ МОДЕЛЬ ========================

// ---------- 1. Класс профиля пользователя (расчёт калорий по формуле) ----------
class UserProfile {
    constructor(name, age, heightCm, weightKg, gender = 'male') {
        this.name = name;
        this.age = age;
        this.heightCm = heightCm;
        this.weightKg = weightKg;
        this.gender = gender;
        this.activityFactor = 1.55; // умеренная активность по умолчанию
    }

    // Базовый метаболизм (BMR) по формуле Миффлина-Сан Жеора
    getBMR() {
        if (this.gender === 'male') {
            return 10 * this.weightKg + 6.25 * this.heightCm - 5 * this.age + 5;
        } else {
            return 10 * this.weightKg + 6.25 * this.heightCm - 5 * this.age - 161;
        }
    }

    // Суточная норма калорий
    getDailyCalorieNeed() {
        return this.getBMR() * this.activityFactor;
    }

    // Расчёт сожжённых калорий на основе веса и интенсивности
    calculateCaloriesBurned(durationMinutes, intensity, workoutType) {
        const metValues = {
            'cardio': { low: 4.0, medium: 6.0, high: 8.5 },
            'strength': { low: 3.0, medium: 5.0, high: 7.0 },
            'flexibility': { low: 2.0, medium: 3.0, high: 4.0 },
            'endurance': { low: 5.0, medium: 7.0, high: 10.0 },
            'other': { low: 3.0, medium: 5.0, high: 7.0 }
        };
        
        const met = (metValues[workoutType] || metValues['other'])[intensity] || 5.0;
        const hours = durationMinutes / 60;
        const calories = met * this.weightKg * hours;
        return Math.round(calories);
    }

    // Установка коэффициента активности
    setActivityFactor(factor) {
        this.activityFactor = factor;
    }

    toJSON() {
        return {
            name: this.name,
            age: this.age,
            heightCm: this.heightCm,
            weightKg: this.weightKg,
            gender: this.gender,
            activityFactor: this.activityFactor
        };
    }

    static fromJSON(data) {
        const profile = new UserProfile(data.name, data.age, data.heightCm, data.weightKg, data.gender);
        profile.activityFactor = data.activityFactor || 1.55;
        return profile;
    }
}

// ---------- 2. Класс тренировки ----------
class Workout {
    constructor(id, type, typeName, date, duration, calories, intensity, notes) {
        this.id = id;
        this.type = type;
        this.typeName = typeName;
        this.date = date;
        this.duration = duration;
        this.calories = calories;
        this.intensity = intensity;
        this.notes = notes;
    }

    // Фабричный метод с автоматическим расчётом калорий
    static create(type, date, duration, intensity, notes, userProfile) {
        const typeNames = {
            'cardio': 'Кардио',
            'strength': 'Силовая',
            'flexibility': 'Гибкость',
            'endurance': 'Выносливость',
            'other': 'Другое'
        };
        
        const calories = userProfile.calculateCaloriesBurned(duration, intensity, type);
        
        return new Workout(
            Date.now() + Math.random(),
            type,
            typeNames[type] || 'Другое',
            date,
            duration,
            calories,
            intensity,
            notes || ''
        );
    }

    toJSON() {
        return {
            id: this.id,
            type: this.type,
            typeName: this.typeName,
            date: this.date,
            duration: this.duration,
            calories: this.calories,
            intensity: this.intensity,
            notes: this.notes
        };
    }

    static fromJSON(data) {
        return new Workout(
            data.id, data.type, data.typeName, data.date,
            data.duration, data.calories, data.intensity, data.notes
        );
    }
}

// ---------- 3. База блюд (калорийность на 100г) ----------
const FOOD_DATABASE = {
    'овсянка': 68, 'гречка': 132, 'рис': 130, 'макароны': 131,
    'куриная грудка': 165, 'говядина': 250, 'свинина': 320,
    'рыба белая': 72, 'лосось': 208, 'креветки': 85,
    'яйцо': 155, 'творог 5%': 121, 'сыр': 350, 'молоко': 60,
    'йогурт': 60, 'хлеб': 265, 'картофель': 77,
    'овощи': 30, 'помидор': 18, 'огурец': 15, 'капуста': 25,
    'яблоко': 52, 'банан': 89, 'апельсин': 47,
    'суп куриный': 50, 'борщ': 60, 'салат цезарь': 150,
    'пицца': 266, 'бургер': 295, 'шоколад': 546, 'печенье': 450,
    'кофе': 30, 'чай': 0, 'сок': 45, 'вода': 0, 'кока-кола': 42
};

// ---------- 4. Класс блюда ----------
class FoodItem {
    constructor(name, grams) {
        this.name = name.toLowerCase();
        this.grams = grams;
        this.caloriesPer100g = FOOD_DATABASE[this.name] || 0;
    }

    get totalCalories() {
        return Math.round(this.caloriesPer100g * this.grams / 100);
    }

    toJSON() {
        return { name: this.name, grams: this.grams, calories: this.totalCalories };
    }

    static fromJSON(data) {
        const item = new FoodItem(data.name, data.grams);
        return item;
    }
}

// ---------- 5. Класс приёма пищи ----------
class Meal {
    static MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];
    static MEAL_NAMES = {
        'breakfast': '🍳 Завтрак',
        'lunch': '🍱 Обед',
        'dinner': '🍲 Ужин',
        'snack': '🥨 Перекус'
    };

    constructor(mealType, date) {
        this.mealType = mealType;
        this.date = date;
        this.foods = [];
    }

    addFood(name, grams) {
        const lowerName = name.toLowerCase();
        if (!FOOD_DATABASE[lowerName]) {
            return false;
        }
        this.foods.push(new FoodItem(lowerName, grams));
        return true;
    }

    removeFood(index) {
        if (index >= 0 && index < this.foods.length) {
            this.foods.splice(index, 1);
            return true;
        }
        return false;
    }

    get totalCalories() {
        return this.foods.reduce((sum, food) => sum + food.totalCalories, 0);
    }

    toJSON() {
        return {
            mealType: this.mealType,
            date: this.date,
            foods: this.foods.map(f => f.toJSON())
        };
    }

    static fromJSON(data) {
        const meal = new Meal(data.mealType, data.date);
        meal.foods = data.foods.map(f => FoodItem.fromJSON(f));
        return meal;
    }
}

// Экспорт для использования в других файлах
window.UserProfile = UserProfile;
window.Workout = Workout;
window.FoodItem = FoodItem;
window.Meal = Meal;
window.FOOD_DATABASE = FOOD_DATABASE;