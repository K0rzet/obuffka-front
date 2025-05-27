const fs = require('fs');
const path = require('path');

console.log('🔍 Проверка исправлений авторизации...\n');

const checks = [
    {
        name: 'API файл создан',
        path: 'src/api/api.ts',
        check: (content) => content.includes('export const api')
    },
    {
        name: 'AuthStore обновлен',
        path: 'src/store/AuthStore.ts',
        check: (content) => content.includes('isInitialized') && content.includes('createTestUser')
    },
    {
        name: 'App.tsx обновлен',
        path: 'src/App.tsx',
        check: (content) => content.includes('LoadingScreen') && content.includes('ErrorScreen')
    },
    {
        name: 'Стили добавлены',
        path: 'src/App.module.scss',
        check: (content) => content.includes('loadingScreen') && content.includes('spinner')
    },
    {
        name: 'Типы пользователя исправлены',
        path: 'src/types/user.ts',
        check: (content) => content.includes('telegramId: string') && content.includes('firstName?')
    }
];

let allPassed = true;

checks.forEach(({ name, path: filePath, check }) => {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
        console.log(`❌ ${name}: файл ${filePath} не найден`);
        allPassed = false;
        return;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    
    if (check(content)) {
        console.log(`✅ ${name}`);
    } else {
        console.log(`❌ ${name}: проверка не прошла`);
        allPassed = false;
    }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
    console.log('✅ Все исправления применены успешно!');
    console.log('\n📋 Следующие шаги:');
    console.log('1. Создайте файл .env с содержимым: VITE_API_URL=https://api.obuffka.ilyacode.ru');
    console.log('2. Запустите: npm install');
    console.log('3. Запустите: npm run dev');
    console.log('4. В режиме разработки будет создан тестовый админ-пользователь');
} else {
    console.log('❌ Некоторые исправления не применились!');
    console.log('Проверьте файлы и повторите процесс.');
}

console.log('\n🔧 Режимы работы:');
console.log('• Разработка: автоматический тестовый пользователь');
console.log('• Telegram WebApp: авторизация через Telegram');
console.log('• При ошибках авторизации показывается экран с кнопкой повтора'); 