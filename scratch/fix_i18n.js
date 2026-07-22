const fs = require('fs');

const dictionariesPath = 'lib/i18n/dictionaries.ts';
const providerPath = 'components/LanguageProvider.tsx';

let dictContent = fs.readFileSync(dictionariesPath, 'utf8');
let providerContent = fs.readFileSync(providerPath, 'utf8');

const startIdx = providerContent.indexOf('const enToId =');
const endIdx = providerContent.indexOf('export function LanguageProvider');

if (startIdx !== -1 && endIdx !== -1) {
  let functionsStr = providerContent.substring(startIdx, endIdx);
  
  let translatorContent = "import { idToEn } from './dictionaries';\nexport type AppLanguage = 'id' | 'en';\n\n";
  
  const regexStart = dictContent.indexOf('export const regexTranslations');
  if(regexStart !== -1) {
    const regexContent = dictContent.substring(regexStart);
    dictContent = dictContent.substring(0, regexStart);
    fs.writeFileSync(dictionariesPath, dictContent, 'utf8');
    
    translatorContent += regexContent + '\n';
  }
  
  translatorContent += functionsStr;
  translatorContent = translatorContent.replace('function translateValue', 'export function translateValue');
  translatorContent = translatorContent.replace('function applyLanguage', 'export function applyLanguage');
  
  fs.writeFileSync('lib/i18n/translator.ts', translatorContent, 'utf8');
  
  providerContent = providerContent.substring(0, startIdx) + providerContent.substring(endIdx);
  providerContent = providerContent.replace("import { idToEn, regexTranslations } from '@/lib/i18n/dictionaries';", "import { translateValue, applyLanguage } from '@/lib/i18n/translator';");
  
  fs.writeFileSync(providerPath, providerContent, 'utf8');
  
  console.log('Successfully extracted translator functions.');
} else {
  console.log('Failed to find indices in LanguageProvider');
}
