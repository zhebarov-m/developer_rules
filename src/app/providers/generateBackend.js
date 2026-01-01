import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../../');

const inputFile = path.join(projectRoot, 'DEVELOPMENT_RULES (B).md');
const outputFile = path.join(__dirname, 'backendRulesContent.ts');

const content = fs.readFileSync(inputFile, 'utf8');

const escaped = content
  .replace(/\\/g, '\\\\')
  .replace(/`/g, '\\`')
  .replace(/\$/g, '\\$');

const output = `/**
 * App layer - полный контент правил разработки Backend
 * Автоматически сгенерировано из DEVELOPMENT_RULES (B).md
 */
export const BACKEND_RULES_CONTENT = \`${escaped}\`;
`;

fs.writeFileSync(outputFile, output, 'utf8');

