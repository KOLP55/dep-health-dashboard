export { BaseScanner } from './base-scanner';
export { NpmScanner } from './npm-scanner';
export { PipScanner } from './pip-scanner';
export { ComposerScanner } from './composer-scanner';
export { MavenScanner, GradleScanner } from './maven-scanner';
export { CargoScanner } from './cargo-scanner';
export { GoModScanner } from './gomod-scanner';
export { NugetScanner } from './nuget-scanner';

import { BaseScanner } from './base-scanner';
import { NpmScanner } from './npm-scanner';
import { PipScanner } from './pip-scanner';
import { ComposerScanner } from './composer-scanner';
import { MavenScanner, GradleScanner } from './maven-scanner';
import { CargoScanner } from './cargo-scanner';
import { GoModScanner } from './gomod-scanner';
import { NugetScanner } from './nuget-scanner';

/**
 * Registry of all available scanners.
 * Add new ecosystem scanners here.
 */
export function getAllScanners(): BaseScanner[] {
  return [
    new NpmScanner(),
    new PipScanner(),
    new ComposerScanner(),
    new MavenScanner(),
    new GradleScanner(),
    new CargoScanner(),
    new GoModScanner(),
    new NugetScanner(),
  ];
}
