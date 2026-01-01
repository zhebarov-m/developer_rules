import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../../');

const inputFile = path.join(projectRoot, 'DEVELOPMENT_RULES.md');
const outputFile = path.join(__dirname, 'fullRulesContent.ts');

const content = fs.readFileSync(inputFile, 'utf8');

// Экранируем backticks и $
const escaped = content
  .replace(/\\/g, '\\\\')
  .replace(/`/g, '\\`')
  .replace(/\$/g, '\\$');

const output = `/**
 * App layer - полный контент правил разработки
 * Автоматически сгенерировано из DEVELOPMENT_RULES.md
 */
export const FULL_RULES_CONTENT = \`${escaped}\`;
`;

fs.writeFileSync(outputFile, output, 'utf8');
