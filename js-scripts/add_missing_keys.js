/**
 * Скрипт синхронизации структуры ключей во всех JSON-файлах локализации фронтенда.
 * Использует ru.json и en.json как источник правды. Добавляет недостающие ключи
 * во все остальные языковые файлы, заполняя их временным английским значением.
 * Запускается перед скриптом перевода.
 * 
 * Использование: node hh-integration-pack/js-scripts/add_missing_keys.js
 */

const fs = require('fs');
const path = require('path');

// Путь к локалям фронтенда
const localesDir = path.join(__dirname, '../frontend/src/i18n/locales');

if (!fs.existsSync(localesDir)) {
    console.error(`Директория локалей не найдена: ${localesDir}`);
    process.exit(1);
}

const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const ruData = JSON.parse(fs.readFileSync(path.join(localesDir, 'ru.json'), 'utf8'));
const enData = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'));

function syncArrays(target, source) {
    let changed = false;
    for (const key in source) {
        if (Array.isArray(source[key])) {
            if (!Array.isArray(target[key])) {
                target[key] = [];
                changed = true;
            }
            while (target[key].length < source[key].length) {
                target[key].push('');
                changed = true;
            }
            for (let i = 0; i < source[key].length; i++) {
                if (typeof source[key][i] === 'object' && source[key][i] !== null) {
                    if (!target[key][i]) {
                        target[key][i] = {};
                        changed = true;
                    }
                    if (syncArrays(target[key][i], source[key][i])) {
                        changed = true;
                    }
                }
            }
        } else if (typeof source[key] === 'object' && source[key] !== null) {
            if (!target[key]) {
                target[key] = {};
                changed = true;
            }
            if (syncArrays(target[key], source[key])) {
                changed = true;
            }
        } else {
            if (!(key in target)) {
                target[key] = source[key];
                changed = true;
            }
        }
    }
    return changed;
}

files.forEach(f => {
    const lang = f.replace('.json', '');
    const filePath = path.join(localesDir, f);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const syncedWithEn = syncArrays(data, enData);
    const syncedWithRu = syncArrays(data, ruData);

    if (syncedWithEn || syncedWithRu) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
        console.log(`[${lang}] Файл локализации обновлен.`);
    } else {
        console.log(`[${lang}] Изменений не требуется.`);
    }
});
