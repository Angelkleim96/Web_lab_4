// Модуль для управления данными (localStorage) с поддержкой профиля и питания
const DataManager = (function() {
    const WORKOUTS_KEY = 'fitness-tracker-workouts';
    const PROFILE_KEY = 'fitness-tracker-profile';
    const MEALS_KEY = 'fitness-tracker-meals';

    // ========== УПРАВЛЕНИЕ ПРОФИЛЕМ ==========
    function getProfile() {
        const profileJSON = localStorage.getItem(PROFILE_KEY);
        if (profileJSON) {
            try {
                return UserProfile.fromJSON(JSON.parse(profileJSON));
            } catch (e) {
                console.error('Ошибка загрузки профиля:', e);
                return null;
            }
        }
        return null;
    }

    function saveProfile(profile) {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile.toJSON()));
        console.log('Профиль сохранён:', profile.name);
    }

    function isProfileComplete() {
        const profile = getProfile();
        return profile !== null && profile.name && profile.age > 0 && profile.heightCm > 0 && profile.weightKg > 0;
    }

    // ========== УПРАВЛЕНИЕ ТРЕНИРОВКАМИ ==========
    function getWorkouts() {
        const workoutsJSON = localStorage.getItem(WORKOUTS_KEY);
        if (workoutsJSON) {
            try {
                const data = JSON.parse(workoutsJSON);
                return data.map(w => Workout.fromJSON(w));
            } catch (e) {
                console.error('Ошибка при парсинге тренировок:', e);
                return [];
            }
        }
        return [];
    }

    function saveWorkouts(workouts) {
        localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts.map(w => w.toJSON())));
    }

    function addWorkout(workout) {
        const workouts = getWorkouts();
        workouts.push(workout);
        saveWorkouts(workouts);
        console.log('Тренировка добавлена:', workout);
        return workout;
    }

    function deleteWorkout(id) {
        let workouts = getWorkouts();
        const initialLength = workouts.length;
        workouts = workouts.filter(w => w.id !== id);
        saveWorkouts(workouts);
        return initialLength !== workouts.length;
    }

    function clearAllWorkouts() {
        localStorage.removeItem(WORKOUTS_KEY);
    }

    // ========== УПРАВЛЕНИЕ ПИТАНИЕМ ==========
    function getMeals(date = null) {
        const mealsJSON = localStorage.getItem(MEALS_KEY);
        let meals = [];
        
        if (mealsJSON) {
            try {
                const data = JSON.parse(mealsJSON);
                meals = data.map(m => Meal.fromJSON(m));
            } catch (e) {
                console.error('Ошибка загрузки питания:', e);
            }
        }
        
        if (date) {
            return meals.filter(m => m.date === date);
        }
        return meals;
    }

    function saveMeals(meals) {
        localStorage.setItem(MEALS_KEY, JSON.stringify(meals.map(m => m.toJSON())));
    }

    function addFoodToMeal(mealType, date, foodName, grams) {
        let meals = getMeals();
        let meal = meals.find(m => m.mealType === mealType && m.date === date);
        
        if (!meal) {
            meal = new Meal(mealType, date);
            meals.push(meal);
        }
        
        const success = meal.addFood(foodName, grams);
        if (success) {
            saveMeals(meals);
        }
        return success;
    }

    function removeFoodFromMeal(mealType, date, foodIndex) {
        let meals = getMeals();
        const meal = meals.find(m => m.mealType === mealType && m.date === date);
        
        if (meal) {
            const success = meal.removeFood(foodIndex);
            if (success && meal.foods.length === 0) {
                // Удаляем пустой приём пищи
                const index = meals.findIndex(m => m.mealType === mealType && m.date === date);
                if (index !== -1) meals.splice(index, 1);
            }
            saveMeals(meals);
            return true;
        }
        return false;
    }

    function getDailyCalories(date) {
        const meals = getMeals(date);
        return meals.reduce((sum, meal) => sum + meal.totalCalories, 0);
    }

    // ========== СТАТИСТИКА ==========
    function filterWorkouts({ period = 'all', type = 'all', search = '' } = {}) {
        let workouts = getWorkouts();
        
        if (period !== 'all') {
            const days = parseInt(period);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            workouts = workouts.filter(w => new Date(w.date) >= cutoffDate);
        }
        
        if (type !== 'all') {
            workouts = workouts.filter(w => w.type === type);
        }
        
        if (search.trim()) {
            const searchLower = search.toLowerCase();
            workouts = workouts.filter(w => 
                w.notes.toLowerCase().includes(searchLower) || 
                w.typeName.toLowerCase().includes(searchLower)
            );
        }
        
        workouts.sort((a, b) => new Date(b.date) - new Date(a.date));
        return workouts;
    }

    function getStatistics(workouts) {
        if (workouts.length === 0) {
            return {
                totalWorkouts: 0,
                totalCalories: 0,
                totalTime: 0,
                avgDuration: 0,
                avgCalories: 0,
                longestWorkout: 0,
                caloriesByDay: [],
                caloriesByType: {}
            };
        }
        
        const totalWorkouts = workouts.length;
        const totalCalories = workouts.reduce((sum, w) => sum + w.calories, 0);
        const totalTime = workouts.reduce((sum, w) => sum + w.duration, 0);
        const avgDuration = Math.round(totalTime / totalWorkouts);
        const avgCalories = Math.round(totalCalories / totalWorkouts);
        const longestWorkout = Math.max(...workouts.map(w => w.duration));
        
        // Группировка по дням (последние 7 дней)
        const caloriesByDay = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            const dayWorkouts = workouts.filter(w => w.date === dateString);
            const dayCalories = dayWorkouts.reduce((sum, w) => sum + w.calories, 0);
            caloriesByDay.push({
                date: dateString,
                calories: dayCalories,
                formattedDate: `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}`
            });
        }
        
        // Группировка по типам
        const caloriesByType = {};
        workouts.forEach(w => {
            caloriesByType[w.typeName] = (caloriesByType[w.typeName] || 0) + w.calories;
        });
        
        return { totalWorkouts, totalCalories, totalTime, avgDuration, avgCalories, longestWorkout, caloriesByDay, caloriesByType };
    }

    function getBestWorkout() {
        const workouts = getWorkouts();
        if (workouts.length === 0) return null;
        return workouts.reduce((best, current) => current.calories > best.calories ? current : best);
    }

    function getTypeName(typeKey) {
        const names = { 'cardio': 'Кардио', 'strength': 'Силовая', 'flexibility': 'Гибкость', 'endurance': 'Выносливость', 'other': 'Другое' };
        return names[typeKey] || 'Неизвестно';
    }

    function getIntensityName(intensityKey) {
        const names = { 'low': 'Низкая', 'medium': 'Средняя', 'high': 'Высокая' };
        return names[intensityKey] || 'Неизвестно';
    }

    return {
        getProfile, saveProfile, isProfileComplete,
        getWorkouts, addWorkout, deleteWorkout, clearAllWorkouts,
        getMeals, addFoodToMeal, removeFoodFromMeal, getDailyCalories,
        filterWorkouts, getStatistics, getBestWorkout, getTypeName, getIntensityName
    };

})();