/**
 * Скрипт проверки целостности структуры локализации фронтенда.
 * Сравнивает все файлы локалей с ru.json и en.json и выводит список отсутствующих ключей.
 * 
 * Использование: node hh-integration-pack/js-scripts/check_locales.js
 */

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../../frontend/src/i18n/locales');

if (!fs.existsSync(localesDir)) {
    console.error(`Директория локалей не найдена: ${localesDir}`);
    process.exit(1);
}

const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

function getKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const data = {};
const allKeys = new Set();

files.forEach(f => {
  const lang = f.replace('.json', '');
  const json = JSON.parse(fs.readFileSync(path.join(localesDir, f), 'utf8'));
  const keys = getKeys(json);
  data[lang] = new Set(keys);
  
  if (lang === 'en' || lang === 'ru') {
    keys.forEach(k => allKeys.add(k));
  }
});

const report = {};
files.forEach(f => {
  const lang = f.replace('.json', '');
  const missing = [];
  allKeys.forEach(k => {
    if (!data[lang].has(k)) {
      missing.push(k);
    }
  });
  if (missing.length > 0) {
    report[lang] = missing;
  }
});

console.log(JSON.stringify(report, null, 2));
