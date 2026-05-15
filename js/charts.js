// Модуль для работы с графиками Chart.js
const Charts = (function() {
    // Цвета для графиков
    const chartColors = {
        primary: '#6366f1',
        secondary: '#10b981',
        accent: '#f59e0b',
        purple: '#9b59b6',
        yellow: '#f1c40f',
        gray: '#95a5a6'
    };
    
    // Типы тренировок и их цвета
    const workoutTypeColors = {
        'Кардио': chartColors.primary,
        'Силовая': chartColors.secondary,
        'Гибкость': chartColors.accent,
        'Выносливость': chartColors.purple,
        'Другое': chartColors.gray
    };
    
    // Инициализация всех графиков
    let caloriesChart = null;
    let workoutTypesChart = null;
    let detailedCaloriesChart = null;
    let efficiencyChart = null;
    
    // Создание графика калорий (последние 7 дней)
    function initCaloriesChart(data) {
        const canvas = document.getElementById('calories-chart');
        if (!canvas) {
            console.error('Canvas элемент calories-chart не найден');
            return false;
        }
        
        const ctx = canvas.getContext('2d');
        
        if (caloriesChart) {
            caloriesChart.destroy();
            caloriesChart = null;
        }
        
        // Проверяем данные
        if (!data || data.length === 0) {
            console.warn('Нет данных для графика калорий');
            // Показываем пустой график
            caloriesChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Нет данных'],
                    datasets: [{
                        label: 'Сожжено калорий',
                        data: [0],
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        borderColor: chartColors.primary,
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { display: true, position: 'top' }
                    }
                }
            });
            return false;
        }
        
        const labels = data.map(item => item.formattedDate || item.date);
        const calories = data.map(item => item.calories);
        
        console.log('Создание графика калорий:', { labels, calories });
        
        caloriesChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Сожжено калорий',
                    data: calories,
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderColor: chartColors.primary,
                    borderWidth: 3,
                    tension: 0.3,
                    fill: true,
                    pointBackgroundColor: chartColors.primary,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: true, position: 'top' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw} ккал`;
                            }
                        }
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true, 
                        title: { display: true, text: 'Калории (ккал)' },
                        ticks: { stepSize: 100 }
                    },
                    x: { grid: { display: false } }
                }
            }
        });
        
        console.log('График калорий создан успешно');
        return true;
    }
    
    // Создание круговой диаграммы типов тренировок
    function initWorkoutTypesChart(data) {
        const canvas = document.getElementById('workout-types-chart');
        if (!canvas) {
            console.error('Canvas элемент workout-types-chart не найден');
            return false;
        }
        
        const ctx = canvas.getContext('2d');
        
        if (workoutTypesChart) {
            workoutTypesChart.destroy();
            workoutTypesChart = null;
        }
        
        // Проверяем данные
        if (!data || Object.keys(data).length === 0) {
            console.warn('Нет данных для диаграммы типов');
            workoutTypesChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Нет данных'],
                    datasets: [{
                        data: [1],
                        backgroundColor: [chartColors.gray],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { display: true, position: 'right' }
                    }
                }
            });
            return false;
        }
        
        const labels = Object.keys(data);
        const values = Object.values(data);
        const backgroundColors = labels.map(label => workoutTypeColors[label] || chartColors.gray);
        
        console.log('Создание диаграммы типов:', { labels, values });
        
        workoutTypesChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: backgroundColors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: true, position: 'right' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? Math.round((context.raw / total) * 100) : 0;
                                return `${context.label}: ${context.raw} ккал (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
        
        console.log('Диаграмма типов создана успешно');
        return true;
    }
    
    // Создание детального графика калорий (для статистики)
    function initDetailedCaloriesChart(workouts) {
        const canvas = document.getElementById('detailed-calories-chart');
        if (!canvas) {
            console.error('Canvas элемент detailed-calories-chart не найден');
            return false;
        }
        
        const ctx = canvas.getContext('2d');
        
        if (detailedCaloriesChart) {
            detailedCaloriesChart.destroy();
            detailedCaloriesChart = null;
        }
        
        // Проверяем данные
        if (!workouts || workouts.length === 0) {
            console.warn('Нет данных для детального графика');
            detailedCaloriesChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Нет данных'],
                    datasets: [{
                        label: 'Сожжено калорий',
                        data: [0],
                        backgroundColor: 'rgba(99, 102, 241, 0.7)',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true
                }
            });
            return false;
        }
        
        // Группировка по дням (последние 30 дней)
        const caloriesByDay = {};
        const today = new Date();
        
        // Создаём массив последних 30 дней
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            caloriesByDay[dateString] = 0;
        }
        
        // Заполняем данными тренировок
        workouts.forEach(workout => {
            if (caloriesByDay.hasOwnProperty(workout.date)) {
                caloriesByDay[workout.date] += workout.calories;
            }
        });
        
        // Формируем метки и данные
        const labels = [];
        const data = [];
        
        Object.keys(caloriesByDay).forEach(date => {
            const d = new Date(date);
            labels.push(`${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}`);
            data.push(caloriesByDay[date]);
        });
        
        console.log('Создание детального графика:', { labels, data });
        
        detailedCaloriesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Сожжено калорий',
                    data: data,
                    backgroundColor: 'rgba(99, 102, 241, 0.7)',
                    borderColor: chartColors.primary,
                    borderWidth: 1,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: true, position: 'top' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw} ккал`;
                            }
                        }
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true, 
                        title: { display: true, text: 'Калории (ккал)' } 
                    },
                    x: { 
                        ticks: { 
                            maxRotation: 45, 
                            minRotation: 45,
                            font: { size: 10 }
                        } 
                    }
                }
            }
        });
        
        console.log('Детальный график создан успешно');
        return true;
    }
    
    // Создание графика эффективности по типам тренировок
    function initEfficiencyChart(workouts) {
        const canvas = document.getElementById('efficiency-chart');
        if (!canvas) {
            console.error('Canvas элемент efficiency-chart не найден');
            return false;
        }
        
        const ctx = canvas.getContext('2d');
        
        if (efficiencyChart) {
            efficiencyChart.destroy();
            efficiencyChart = null;
        }
        
        // Проверяем данные
        if (!workouts || workouts.length === 0) {
            console.warn('Нет данных для графика эффективности');
            efficiencyChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Нет данных'],
                    datasets: [{
                        label: 'Калорий в минуту',
                        data: [0],
                        backgroundColor: [chartColors.gray],
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true
                }
            });
            return false;
        }
        
        // Группировка по типам тренировок
        const typeStats = {};
        
        workouts.forEach(workout => {
            if (!typeStats[workout.typeName]) {
                typeStats[workout.typeName] = {
                    totalCalories: 0,
                    totalDuration: 0,
                    count: 0
                };
            }
            typeStats[workout.typeName].totalCalories += workout.calories;
            typeStats[workout.typeName].totalDuration += workout.duration;
            typeStats[workout.typeName].count += 1;
        });
        
        const labels = Object.keys(typeStats);
        const caloriesPerMinute = labels.map(type => {
            const stats = typeStats[type];
            return stats.totalDuration > 0 ? Math.round(stats.totalCalories / stats.totalDuration * 10) / 10 : 0;
        });
        
        const backgroundColors = labels.map(label => workoutTypeColors[label] || chartColors.gray);
        
        console.log('Создание графика эффективности:', { labels, caloriesPerMinute });
        
        efficiencyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Калорий в минуту',
                    data: caloriesPerMinute,
                    backgroundColor: backgroundColors,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw} ккал/мин`;
                            }
                        }
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true, 
                        title: { display: true, text: 'Ккал/мин' } 
                    }
                }
            }
        });
        
        console.log('График эффективности создан успешно');
        return true;
    }
    
    // Обновление всех графиков на дашборде
    function updateDashboardCharts() {
        console.log('Обновление графиков дашборда...');
        try {
            const workouts = DataManager.getWorkouts();
            console.log('Тренировок найдено:', workouts.length);
            
            const stats = DataManager.getStatistics(workouts);
            console.log('Статистика для графиков:', stats);
            
            initCaloriesChart(stats.caloriesByDay);
            initWorkoutTypesChart(stats.caloriesByType);
            
            console.log('Графики дашборда обновлены успешно');
        } catch (error) {
            console.error('Ошибка при обновлении графиков дашборда:', error);
        }
    }
    
    // Обновление графиков в разделе статистики
    function updateStatisticsCharts(period = '30', type = 'all') {
        console.log('Обновление графиков статистики...', { period, type });
        try {
            const filteredWorkouts = DataManager.filterWorkouts({period, type});
            console.log('Отфильтрованных тренировок:', filteredWorkouts.length);
            
            const stats = DataManager.getStatistics(filteredWorkouts);
            
            initDetailedCaloriesChart(filteredWorkouts);
            initEfficiencyChart(filteredWorkouts);
            
            console.log('Графики статистики обновлены успешно');
            return stats;
        } catch (error) {
            console.error('Ошибка при обновлении графиков статистики:', error);
            return DataManager.getStatistics([]);
        }
    }
    
    // Очистка всех графиков
    function destroyAllCharts() {
        console.log('Очистка всех графиков...');
        if (caloriesChart) { 
            caloriesChart.destroy(); 
            caloriesChart = null; 
        }
        if (workoutTypesChart) { 
            workoutTypesChart.destroy(); 
            workoutTypesChart = null; 
        }
        if (detailedCaloriesChart) { 
            detailedCaloriesChart.destroy(); 
            detailedCaloriesChart = null; 
        }
        if (efficiencyChart) { 
            efficiencyChart.destroy(); 
            efficiencyChart = null; 
        }
        console.log('Все графики очищены');
    }
    
    return {
        updateDashboardCharts,
        updateStatisticsCharts,
        destroyAllCharts
    };

})();