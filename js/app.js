// Глобальный экспорт всех модулей
(function() {
    // Проверяем, что все модули загружены
    if (typeof DataManager !== 'undefined') {
        window.DataManager = DataManager;
    }
    
    if (typeof Charts !== 'undefined') {
        window.Charts = Charts;
    }
    
    if (typeof UserProfile !== 'undefined') {
        window.UserProfile = UserProfile;
        window.Workout = Workout;
        window.FoodItem = FoodItem;
        window.Meal = Meal;
        window.FOOD_DATABASE = FOOD_DATABASE;
    }
    
    console.log('✅ Все модули успешно экспортированы в window');
    console.log('Доступные модули:', {
        DataManager: !!window.DataManager,
        Charts: !!window.Charts,
        UserProfile: !!window.UserProfile,
        Workout: !!window.Workout,
        Meal: !!window.Meal
    });
})();