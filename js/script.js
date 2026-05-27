// Основной файл приложения
document.addEventListener('DOMContentLoaded', function() {
    // Переменные для состояния приложения
    let workoutToDelete = null;
    
    // Утилитарные функции
    
    // Показать уведомление
    function showNotification(message, type = 'info') {
        // Удаляем существующее уведомление
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'assertive');
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 
                                  type === 'error' ? 'exclamation-circle' : 
                                  'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" aria-label="Закрыть уведомление">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Добавление стилей для уведомления, если их еще нет
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
                    padding: 18px 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    min-width: 280px;
                    max-width: 400px;
                    z-index: 10000;
                    animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border-left: 5px solid #6366f1;
                    backdrop-filter: blur(10px);
                    background: rgba(255, 255, 255, 0.95);
                }
                
                .notification-success {
                    border-left-color: #10b981;
                }
                
                .notification-error {
                    border-left-color: #ef4444;
                }
                
                .notification-info {
                    border-left-color: #3b82f6;
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-grow: 1;
                }
                
                .notification-content i {
                    font-size: 1.3rem;
                }
                
                .notification-success .notification-content i {
                    color: #10b981;
                }
                
                .notification-error .notification-content i {
                    color: #ef4444;
                }
                
                .notification-info .notification-content i {
                    color: #3b82f6;
                }
                
                .notification-content span {
                    font-weight: 500;
                    color: #1f2937;
                    font-size: 1rem;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: #6b7280;
                    cursor: pointer;
                    font-size: 1rem;
                    margin-left: 20px;
                    padding: 4px;
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }
                
                .notification-close:hover {
                    background: #f3f4f6;
                    color: #1f2937;
                }
                
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Закрытие уведомления по кнопке
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                notification.style.animation = 'slideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                setTimeout(() => {
                    if (notification.parentNode) notification.remove();
                }, 300);
            });
        }
        
        // Автоматическое закрытие через 4 секунды
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                setTimeout(() => {
                    if (notification.parentNode) notification.remove();
                }, 300);
            }
        }, 4000);
    }
    
    // Форматирование даты для отображения
    function formatDisplayDate(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${day}.${month}.${year}`;
        } catch (e) {
            return dateString;
        }
    }
    
    // Получение иконки для типа тренировки
    function getWorkoutIcon(type) {
        const icons = {
            'cardio': 'running',
            'strength': 'dumbbell',
            'flexibility': 'spa',
            'endurance': 'tachometer-alt',
            'other': 'heartbeat'
        };
        return icons[type] || 'dumbbell';
    }
    
    // Окно профиля
    function showProfileModal() {
        const profile = DataManager.getProfile();
        
        const modalHtml = `
            <div id="profile-modal" class="modal" style="display: flex;">
                <div class="modal-content" style="max-width: 500px; max-height: 90vh; overflow-y: auto;">
                    <h3><i class="fas fa-user-circle"></i> Ваш профиль</h3>
                    <form id="profile-form">
                        <div class="form-group">
                            <label><i class="fas fa-user"></i> Имя</label>
                            <input type="text" id="profile-name" value="${profile?.name || ''}" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label><i class="fas fa-calendar"></i> Возраст</label>
                                <input type="number" id="profile-age" value="${profile?.age || ''}" min="10" max="120" required>
                            </div>
                            <div class="form-group">
                                <label><i class="fas fa-venus-mars"></i> Пол</label>
                                <select id="profile-gender">
                                    <option value="male" ${profile?.gender === 'male' ? 'selected' : ''}>Мужской</option>
                                    <option value="female" ${profile?.gender === 'female' ? 'selected' : ''}>Женский</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label><i class="fas fa-ruler"></i> Рост (см)</label>
                                <input type="number" id="profile-height" value="${profile?.heightCm || ''}" step="1" min="50" max="250" required>
                            </div>
                            <div class="form-group">
                                <label><i class="fas fa-weight-scale"></i> Вес (кг)</label>
                                <input type="number" id="profile-weight" value="${profile?.weightKg || ''}" step="0.5" min="20" max="300" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-running"></i> Активность</label>
                            <select id="profile-activity">
                                <option value="1.2" ${profile?.activityFactor === 1.2 ? 'selected' : ''}>Сидячий образ жизни</option>
                                <option value="1.375" ${profile?.activityFactor === 1.375 ? 'selected' : ''}>Лёгкая активность (1-3 дня/нед)</option>
                                <option value="1.55" ${profile?.activityFactor === 1.55 ? 'selected' : ''}>Умеренная активность (3-5 дней/нед)</option>
                                <option value="1.725" ${profile?.activityFactor === 1.725 ? 'selected' : ''}>Высокая активность (6-7 дней/нед)</option>
                                <option value="1.9" ${profile?.activityFactor === 1.9 ? 'selected' : ''}>Очень высокая (спортсмен)</option>
                            </select>
                        </div>
                        ${profile ? `<div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border-radius: 12px; padding: 16px; margin-top: 20px;">
                            <p style="margin: 0;"><strong>📊 Ваша норма:</strong> ${Math.round(profile.getDailyCalorieNeed())} ккал/день</p>
                            <p style="margin: 8px 0 0;"><strong>🔥 Базовый метаболизм:</strong> ${Math.round(profile.getBMR())} ккал</p>
                        </div>` : ''}
                        <div class="form-actions" style="margin-top: 24px;">
                            <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Сохранить</button>
                            <button type="button" id="close-profile-modal" class="btn btn-secondary">Отмена</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // Удаляем существующее модальное окно
        const existingModal = document.getElementById('profile-modal');
        if (existingModal) existingModal.remove();
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        const modal = document.getElementById('profile-modal');
        const form = document.getElementById('profile-form');
        
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const name = document.getElementById('profile-name')?.value;
                const age = parseInt(document.getElementById('profile-age')?.value);
                const gender = document.getElementById('profile-gender')?.value;
                const heightCm = parseFloat(document.getElementById('profile-height')?.value);
                const weightKg = parseFloat(document.getElementById('profile-weight')?.value);
                const activityFactor = parseFloat(document.getElementById('profile-activity')?.value);
                
                if (!name || isNaN(age) || isNaN(heightCm) || isNaN(weightKg)) {
                    showNotification('Заполните все поля', 'error');
                    return;
                }
                
                const newProfile = new UserProfile(name, age, heightCm, weightKg, gender);
                newProfile.setActivityFactor(activityFactor);
                DataManager.saveProfile(newProfile);
                
                showNotification(`Профиль сохранён! Норма: ${Math.round(newProfile.getDailyCalorieNeed())} ккал/день`, 'success');
                modal.remove();
                loadDashboard();
            });
        }
        
        const closeBtn = document.getElementById('close-profile-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => modal.remove());
        }
    }
    
    // Окно питания
    function showNutritionModal() {
        const today = new Date().toISOString().split('T')[0];
        const profile = DataManager.getProfile();
        
        if (!profile) {
            showNotification('Сначала заполните профиль!', 'error');
            showProfileModal();
            return;
        }
        
        // Функция для обновления отображения (рекурсивный вызов для обновления модалки)
        function refreshNutritionModal() {
            showNutritionModal();
        }
        
        const dailyCalories = DataManager.getDailyCalories(today);
        const dailyNeed = profile.getDailyCalorieNeed();
        const remaining = Math.max(0, dailyNeed - dailyCalories);
        const percentage = Math.min(100, (dailyCalories / dailyNeed) * 100);
        
        const meals = DataManager.getMeals(today);
        const mealsByType = {};
        Meal.MEAL_TYPES.forEach(type => {
            const meal = meals.find(m => m.mealType === type);
            mealsByType[type] = meal || new Meal(type, today);
        });
        
        let foodsHtml = '';
        for (const [type, meal] of Object.entries(mealsByType)) {
            foodsHtml += `
                <div class="nutrition-meal" style="margin-bottom: 24px; background: #f9fafb; border-radius: 12px; padding: 16px;">
                    <h4 style="margin-bottom: 12px; color: #1f2937;">${Meal.MEAL_NAMES[type]} <span style="color: #6366f1;">(${meal.totalCalories} ккал)</span></h4>
                    <div id="meal-foods-${type}">
                        ${meal.foods.map((food, idx) => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                <span><strong>${food.name}</strong> - ${food.grams}г</span>
                                <span style="color: #f59e0b;">${food.totalCalories} ккал</span>
                                <button class="remove-food-btn" data-meal="${type}" data-index="${idx}" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 1.2rem;">✕</button>
                            </div>
                        `).join('') || '<div style="color: #9ca3af; padding: 8px 0;">Нет добавленных блюд</div>'}
                    </div>
                    <div class="add-food-form" style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
                        <input type="text" placeholder="Блюдо (овсянка, курица...)" class="food-name-${type}" style="flex: 2; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px;">
                        <input type="number" placeholder="Граммы" class="food-grams-${type}" style="width: 90px; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px;">
                        <button class="add-food-btn" data-meal="${type}" style="background: #6366f1; color: white; border: none; padding: 8px 20px; border-radius: 8px; cursor: pointer;">+</button>
                    </div>
                </div>
            `;
        }
        
        const modalHtml = `
            <div id="nutrition-modal" class="modal" style="display: flex;">
                <div class="modal-content" style="max-width: 650px; max-height: 85vh; overflow-y: auto;">
                    <h3><i class="fas fa-utensils"></i> Трекер питания</h3>
                    
                    <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                            <p style="margin: 0;"><strong>🍽️ Сегодня:</strong> ${dailyCalories} ккал</p>
                            <p style="margin: 0;"><strong>🎯 Цель:</strong> ${Math.round(dailyNeed)} ккал</p>
                        </div>
                        <p style="margin: 0 0 12px;"><strong>⚡ Осталось:</strong> ${Math.round(remaining)} ккал</p>
                        <div style="background: rgba(255,255,255,0.3); border-radius: 10px; height: 10px; overflow: hidden;">
                            <div style="background: white; width: ${percentage}%; height: 10px; border-radius: 10px;"></div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="font-weight: 600; margin-bottom: 8px; display: block;"><i class="fas fa-search"></i> Поиск блюда</label>
                        <input type="text" id="food-search" placeholder="Например: овсянка, курица, гречка..." style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 12px;">
                        <div id="food-suggestions" style="display: none; background: white; border: 1px solid #e5e7eb; border-radius: 8px; margin-top: 4px; max-height: 150px; overflow-y: auto;"></div>
                    </div>
                    
                    <div id="meals-container">
                        ${foodsHtml}
                    </div>
                    
                    <div class="form-actions" style="margin-top: 24px;">
                        <button type="button" id="close-nutrition-modal" class="btn btn-secondary">Закрыть</button>
                    </div>
                </div>
            </div>
        `;
        
        const existingModal = document.getElementById('nutrition-modal');
        if (existingModal) existingModal.remove();
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Поиск блюд
        const searchInput = document.getElementById('food-search');
        const suggestionsDiv = document.getElementById('food-suggestions');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                const query = searchInput.value.toLowerCase().trim();
                if (query.length < 2) {
                    suggestionsDiv.style.display = 'none';
                    return;
                }
                
                const matches = Object.keys(window.FOOD_DATABASE || {})
                    .filter(food => food.includes(query))
                    .slice(0, 8);
                
                if (matches.length > 0) {
                    suggestionsDiv.innerHTML = matches.map(food => 
                        `<div style="padding: 10px 12px; cursor: pointer; border-bottom: 1px solid #f3f4f6;" data-food="${food}">
                            ${food} — ${window.FOOD_DATABASE[food]} ккал/100г
                        </div>`
                    ).join('');
                    suggestionsDiv.style.display = 'block';
                    
                    suggestionsDiv.querySelectorAll('[data-food]').forEach(el => {
                        el.addEventListener('click', () => {
                            searchInput.value = el.dataset.food;
                            suggestionsDiv.style.display = 'none';
                        });
                    });
                } else {
                    suggestionsDiv.style.display = 'none';
                }
            });
        }
        
        // Добавление блюд
        document.querySelectorAll('.add-food-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mealType = btn.dataset.meal;
                const nameInput = document.querySelector(`.food-name-${mealType}`);
                const gramsInput = document.querySelector(`.food-grams-${mealType}`);
                
                let foodName = nameInput?.value.trim();
                const grams = parseFloat(gramsInput?.value);
                
                if (!foodName || isNaN(grams) || grams <= 0) {
                    showNotification('Введите название и вес блюда', 'error');
                    return;
                }
                
                foodName = foodName.toLowerCase();
                const success = DataManager.addFoodToMeal(mealType, today, foodName, grams);
                if (success) {
                    showNotification(`➕ Добавлено: ${foodName} (${grams}г)`, 'success');
                    refreshNutritionModal();
                } else {
                    showNotification(`❌ Блюдо "${foodName}" не найдено в базе`, 'error');
                }
            });
        });
        
        // Удаление блюд
        document.querySelectorAll('.remove-food-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mealType = btn.dataset.meal;
                const index = parseInt(btn.dataset.index);
                DataManager.removeFoodFromMeal(mealType, today, index);
                refreshNutritionModal();
            });
        });
        
        const closeBtn = document.getElementById('close-nutrition-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('nutrition-modal')?.remove();
                loadDashboard();
            });
        }
    }
    
    // Навигация
    function initNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        
        navButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const tabId = this.getAttribute('data-tab');
                const href = this.getAttribute('href');
                
                if (href && href.startsWith('#')) {
                    const targetElement = document.querySelector(href);
                    if (targetElement) {
                        const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
                        const targetPosition = targetElement.offsetTop - headerHeight - 20;
                        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                    }
                }
                
                navButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
                
                const tabElement = document.getElementById(tabId);
                if (tabElement) {
                    tabElement.classList.add('active');
                    if (tabId === 'dashboard') loadDashboard();
                    if (tabId === 'statistics') loadStatistics();
                    if (tabId === 'history') loadHistory();
                }
                history.pushState(null, null, href);
            });
        });
    }
    
    // Форма тренировки
    function initForm() {
        const form = document.getElementById('workout-form');
        const clearButton = document.getElementById('clear-form');
        
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                saveWorkout();
            });
        }
        
        if (clearButton) {
            clearButton.addEventListener('click', function() {
                if (form) form.reset();
                const dateInput = document.getElementById('workout-date');
                if (dateInput) {
                    const today = new Date();
                    const formattedDate = today.toISOString().split('T')[0];
                    dateInput.value = formattedDate;
                }
                const intensitySelect = document.getElementById('workout-intensity');
                if (intensitySelect) intensitySelect.value = 'medium';
                // Очищаем поле калорий и делаем его необязательным визуально
                const caloriesInput = document.getElementById('calories-burned');
                if (caloriesInput) {
                    caloriesInput.value = '';
                    caloriesInput.placeholder = 'Рассчитается автоматически';
                }
                updateFormPreview();
                showNotification('Форма очищена', 'info');
            });
        }
    }
    
    function setupFormPreview() {
        const formInputs = document.querySelectorAll('#workout-form input, #workout-form select, #workout-form textarea');
        formInputs.forEach(input => {
            input.addEventListener('input', updateFormPreview);
            input.addEventListener('change', updateFormPreview);
        });
        updateFormPreview();
    }
    
    function updateFormPreview() {
        const type = document.getElementById('workout-type')?.value || '';
        const date = document.getElementById('workout-date')?.value || '';
        const duration = document.getElementById('workout-duration')?.value || '0';
        const manualCalories = document.getElementById('calories-burned')?.value || '';
        const intensity = document.getElementById('workout-intensity')?.value || 'medium';
        const notes = document.getElementById('workout-notes')?.value || '';
        
        const previewType = document.getElementById('preview-type');
        const previewDate = document.getElementById('preview-date');
        const previewDuration = document.getElementById('preview-duration');
        const previewCalories = document.getElementById('preview-calories');
        const previewIntensity = document.getElementById('preview-intensity');
        const previewNotes = document.getElementById('preview-notes');
        
        if (previewType) previewType.textContent = type ? DataManager.getTypeName(type) : 'Выберите тип тренировки';
        if (previewDate) previewDate.textContent = date ? formatDisplayDate(date) : 'Сегодня';
        if (previewDuration) previewDuration.textContent = duration;
        
        // Для предпросмотра калорий показываем введённые или подсказку
        if (previewCalories) {
            if (manualCalories && parseInt(manualCalories) > 0) {
                previewCalories.textContent = manualCalories;
                previewCalories.style.color = '#f59e0b';
            } else {
                previewCalories.textContent = 'авто';
                previewCalories.style.color = '#10b981';
            }
        }
        
        if (previewIntensity) previewIntensity.textContent = DataManager.getIntensityName(intensity);
        if (previewNotes) previewNotes.textContent = notes || 'Пока нет заметок';
    }
    
    function saveWorkout() {
        const type = document.getElementById('workout-type')?.value;
        const date = document.getElementById('workout-date')?.value;
        const duration = parseInt(document.getElementById('workout-duration')?.value);
        const intensity = document.getElementById('workout-intensity')?.value;
        const notes = document.getElementById('workout-notes')?.value;
        const manualCaloriesInput = document.getElementById('calories-burned')?.value;
        
        const profile = DataManager.getProfile();
        
        if (!profile) {
            showNotification('Сначала заполните профиль пользователя!', 'error');
            showProfileModal();
            return;
        }
        
        if (!type) { showNotification('Выберите тип тренировки', 'error'); return; }
        if (!date) { showNotification('Укажите дату', 'error'); return; }
        if (!duration || duration <= 0 || duration > 300) { 
            showNotification('Длительность от 1 до 300 минут', 'error'); 
            return; 
        }
        
        // Создаём тренировку с автоматическим расчётом калорий на основе профиля
        const workout = Workout.create(type, date, duration, intensity, notes, profile);
        
        // Если пользователь ввёл свои калории (и значение > 0), используем их
        // Иначе оставляем автоматически рассчитанные
        if (manualCaloriesInput && parseInt(manualCaloriesInput) > 0) {
            workout.calories = parseInt(manualCaloriesInput);
            showNotification(`🏋️ Тренировка сохранена! Сожжено: ${workout.calories} ккал (введено вручную)`, 'success');
        } else {
            showNotification(`🏋️ Тренировка сохранена! Сожжено: ${workout.calories} ккал (рассчитано автоматически)`, 'success');
        }
        
        DataManager.addWorkout(workout);
        
        // Сброс формы
        const form = document.getElementById('workout-form');
        if (form) form.reset();
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('workout-date');
        if (dateInput) dateInput.value = today;
        const intensitySelect = document.getElementById('workout-intensity');
        if (intensitySelect) intensitySelect.value = 'medium';
        const caloriesInput = document.getElementById('calories-burned');
        if (caloriesInput) {
            caloriesInput.value = '';
            caloriesInput.placeholder = 'Рассчитается автоматически';
        }
        
        updateFormPreview();
        loadDashboard();
        
        // Переход на историю
        const historyTab = document.querySelector('[href="#history"]');
        if (historyTab) historyTab.click();
    }
    
    // Дашборд
    function loadDashboard() {
        const profile = DataManager.getProfile();
        const workouts = DataManager.getWorkouts();
        const stats = DataManager.getStatistics(workouts);
        const bestWorkout = DataManager.getBestWorkout();
        
        const totalCaloriesEl = document.getElementById('total-calories');
        const totalWorkoutsEl = document.getElementById('total-workouts');
        const avgDurationEl = document.getElementById('avg-duration');
        const bestWorkoutEl = document.getElementById('best-workout');
        
        if (totalCaloriesEl) totalCaloriesEl.textContent = stats.totalCalories;
        if (totalWorkoutsEl) totalWorkoutsEl.textContent = stats.totalWorkouts;
        if (avgDurationEl) avgDurationEl.textContent = stats.avgDuration;
        if (bestWorkoutEl) bestWorkoutEl.textContent = bestWorkout ? bestWorkout.calories : 0;
        
        // Добавляем карточку профиля
        let profileInfoDiv = document.getElementById('profile-info-card');
        if (!profileInfoDiv && profile) {
            const dashboardCards = document.querySelector('.dashboard-cards');
            if (dashboardCards && dashboardCards.children.length === 4) {
                const newCard = document.createElement('div');
                newCard.className = 'card';
                newCard.id = 'profile-info-card';
                newCard.innerHTML = `
                    <div class="card-icon" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="card-info">
                        <h3>${profile.name}</h3>
                        <p class="card-value" id="profile-calories">${Math.round(profile.getDailyCalorieNeed())}</p>
                        <p class="card-subtitle">норма ккал/день</p>
                    </div>
                `;
                dashboardCards.appendChild(newCard);
            }
        } else if (profileInfoDiv && profile) {
            profileInfoDiv.querySelector('h3').textContent = profile.name;
            const profileCalories = document.getElementById('profile-calories');
            if (profileCalories) profileCalories.textContent = Math.round(profile.getDailyCalorieNeed());
        }
        
        if (window.Charts) {
            Charts.updateDashboardCharts();
        }
    }
    
    // Статистика
    function initStatisticsFilters() {
        const periodSelect = document.getElementById('stats-period');
        const typeSelect = document.getElementById('stats-type');
        if (periodSelect) periodSelect.addEventListener('change', loadStatistics);
        if (typeSelect) typeSelect.addEventListener('change', loadStatistics);
    }
    
    function loadStatistics() {
         const period = document.getElementById('stats-period')?.value || '30';
    const type = document.getElementById('stats-type')?.value || 'all';
    
    console.log('Загрузка статистики:', { period, type });
    
    // Получаем отфильтрованные тренировки
    const filteredWorkouts = DataManager.filterWorkouts({period, type});
    
    // Получаем статистику
    const stats = DataManager.getStatistics(filteredWorkouts);
    
    console.log('Статистика:', stats);
    
    // Обновляем графики
    if (window.Charts) {
        Charts.updateStatisticsCharts(period, type);
    }
    
    // Обновляем текстовые значения
    const elements = {
        'stats-total-workouts': stats.totalWorkouts,
        'stats-total-calories': stats.totalCalories,
        'stats-total-time': Math.round(stats.totalTime / 60),
        'stats-avg-duration': stats.avgDuration,
        'stats-avg-calories': stats.avgCalories,
        'stats-longest': stats.longestWorkout
    };
    
    for (const [id, value] of Object.entries(elements)) {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = value;
            console.log(`Обновлено ${id}: ${value}`);
        } else {
            console.warn(`Элемент ${id} не найден`);
        }
    }
}
    
    // История
    function initHistory() {
        const searchInput = document.getElementById('history-search');
        const clearButton = document.getElementById('clear-history');
        
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                loadHistory(this.value);
            });
        }
        
        if (clearButton) {
            clearButton.addEventListener('click', function() {
                if (confirm('Вы уверены, что хотите удалить всю историю тренировок?')) {
                    DataManager.clearAllWorkouts();
                    loadHistory();
                    loadDashboard();
                    if (window.Charts) Charts.destroyAllCharts();
                    showNotification('История очищена', 'info');
                }
            });
        }
    }
    
    function loadHistory(search = '') {
        const historyContainer = document.getElementById('workout-history');
        if (!historyContainer) return;
        
        const workouts = DataManager.filterWorkouts({ search });
        
        if (workouts.length === 0) {
            historyContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-dumbbell"></i>
                    <p>${search ? 'По вашему запросу ничего не найдено' : 'У вас пока нет добавленных тренировок'}</p>
                    <button class="btn btn-primary go-to-add">
                        <i class="fas fa-plus-circle"></i> Добавить тренировку
                    </button>
                </div>
            `;
            const addBtn = historyContainer.querySelector('.go-to-add');
            if (addBtn) {
                addBtn.addEventListener('click', () => {
                    document.querySelector('[href="#add-workout"]')?.click();
                });
            }
            return;
        }
        
        let html = '';
        workouts.forEach(workout => {
            html += `
                <div class="workout-item" data-id="${workout.id}">
                    <div class="workout-info">
                        <div class="workout-header">
                            <span class="workout-type">
                                <i class="fas fa-${getWorkoutIcon(workout.type)}"></i>
                                ${workout.typeName}
                            </span>
                            <span class="workout-date">${formatDisplayDate(workout.date)}</span>
                        </div>
                        <div class="workout-details">
                            <div class="workout-detail"><i class="fas fa-clock"></i> ${workout.duration} мин</div>
                            <div class="workout-detail"><i class="fas fa-fire"></i> ${workout.calories} ккал</div>
                            <div class="workout-detail"><i class="fas fa-bolt"></i> ${DataManager.getIntensityName(workout.intensity)}</div>
                        </div>
                        ${workout.notes ? `<div class="workout-notes">${workout.notes}</div>` : ''}
                    </div>
                    <div class="workout-actions">
                        <button class="action-btn delete-btn" data-id="${workout.id}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        historyContainer.innerHTML = html;
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseFloat(this.dataset.id);
                showDeleteModal(id);
            });
        });
    }
    
    // Окно удаления
    function initModal() {
        const confirmBtn = document.getElementById('confirm-delete');
        const cancelBtn = document.getElementById('cancel-delete');
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', function() {
                if (workoutToDelete) {
                    DataManager.deleteWorkout(workoutToDelete);
                    showNotification('Тренировка удалена', 'success');
                    loadHistory(document.getElementById('history-search')?.value || '');
                    loadDashboard();
                    if (document.getElementById('statistics')?.classList.contains('active')) {
                        loadStatistics();
                    }
                    hideModal();
                    workoutToDelete = null;
                }
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', hideModal);
        }
        
        const modal = document.getElementById('delete-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) hideModal();
            });
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') hideModal();
        });
    }
    
    function showDeleteModal(id) {
        workoutToDelete = id;
        const modal = document.getElementById('delete-modal');
        if (modal) modal.style.display = 'flex';
    }
    
    function hideModal() {
        const modal = document.getElementById('delete-modal');
        if (modal) modal.style.display = 'none';
        workoutToDelete = null;
    }
    
    // Добавление кнопок
    function addExtraButtons() {
        const nav = document.querySelector('.nav');
        if (!nav) return;
        
        // Проверяем, нет ли уже таких кнопок
        if (document.querySelector('.nav-btn[data-action="profile"]')) return;
        
        const profileBtn = document.createElement('a');
        profileBtn.href = '#';
        profileBtn.className = 'nav-btn';
        profileBtn.setAttribute('data-action', 'profile');
        profileBtn.innerHTML = '<i class="fas fa-user-circle"></i> Профиль';
        profileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showProfileModal();
        });
        
        const nutritionBtn = document.createElement('a');
        nutritionBtn.href = '#';
        nutritionBtn.className = 'nav-btn';
        nutritionBtn.setAttribute('data-action', 'nutrition');
        nutritionBtn.innerHTML = '<i class="fas fa-utensils"></i> Питание';
        nutritionBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!DataManager.isProfileComplete()) {
                showNotification('Сначала заполните профиль!', 'error');
                showProfileModal();
                return;
            }
            showNutritionModal();
        });
        
        nav.appendChild(profileBtn);
        nav.appendChild(nutritionBtn);
    }
    
    // Иницилизация
    function initApp() {
        // Устанавливаем дату в форме
        const dateInput = document.getElementById('workout-date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
            dateInput.max = today;
        }
        
        // Делаем поле калорий необязательным
        const caloriesField = document.getElementById('calories-burned');
        if (caloriesField) {
            caloriesField.required = false;
            caloriesField.placeholder = 'Рассчитается автоматически';
        }
        
        initNavigation();
        initForm();
        initStatisticsFilters();
        initHistory();
        initModal();
        setupFormPreview();
        addExtraButtons();
        
        // Загружаем активную вкладку
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab) {
            const id = activeTab.id;
            if (id === 'dashboard') loadDashboard();
            if (id === 'statistics') loadStatistics();
            if (id === 'history') loadHistory();
        } else {
            loadDashboard();
        }
        
        // Проверка хэша URL
        if (window.location.hash) {
            const tabId = window.location.hash.substring(1);
            const tabEl = document.getElementById(tabId);
            if (tabEl) {
                document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
                const activeBtn = document.querySelector(`[href="${window.location.hash}"]`);
                if (activeBtn) activeBtn.classList.add('active');
                tabEl.classList.add('active');
            }
        }
        
        // Показываем профиль, если его нет
        setTimeout(() => {
            if (!DataManager.isProfileComplete()) {
                showNotification('👋 Заполните профиль для расчёта калорий', 'info');
                showProfileModal();
            }
        }, 500);
    }
    
    // Запуск
    initApp();
});
