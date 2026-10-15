import fs from 'fs';
import path from "path";
import YAML from 'yaml';
import swaggerSpec from '../src/config/openapi.js';
import { fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const buildDirectory = path.join(__dirname, '..', 'build');

fs.mkdirSync(buildDirectory, {
  recursive: true,
});

const outputPath = path.join(
  buildDirectory,
  'openapi.yaml'
);

fs.writeFileSync(
  outputPath,
  YAML.stringify(swaggerSpec),
  'utf8'
);

console.log(`OpenAPI specification created: ${outputPath}`);
