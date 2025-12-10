import * as fs from 'fs-extra';
import { buildDir } from './playwright.config';

export default async function globalSetup() {
  if (fs.existsSync(buildDir)) {
    fs.removeSync(buildDir);
  }
}
