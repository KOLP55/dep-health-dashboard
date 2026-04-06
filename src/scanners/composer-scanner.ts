import { BaseScanner } from './base-scanner';
import { Ecosystem, Vulnerability } from '../types';
import { fetchJSON } from '../utils/http';
import { checkVulnerabilities } from '../utils/vuln-checker';

/**
 * Scanner for PHP/Laravel projects (composer.json → Packagist API + OSV.dev vulnerabilities)
 */
export class ComposerScanner extends BaseScanner {
  readonly ecosystem: Ecosystem = 'composer';
  readonly manifestFiles = ['**/composer.json'];

  parseManifest(content: string, filePath: string) {
    const composer = JSON.parse(content);
    const deps: { name: string; version: string; isDev: boolean }[] = [];

    if (composer.require) {
      for (const [name, version] of Object.entries(composer.require)) {
        // Skip PHP version constraint and extensions
        if (name === 'php' || name.startsWith('ext-')) { continue; }
        deps.push({ name, version: String(version), isDev: false });
      }
    }

    if (composer['require-dev']) {
      for (const [name, version] of Object.entries(composer['require-dev'])) {
        deps.push({ name, version: String(version), isDev: true });
      }
    }

    return deps;
  }

  async fetchPackageInfo(packageName: string) {
    try {
      // Packagist API (free, no auth)
      const data = await fetchJSON<any>(
        `https://repo.packagist.org/p2/${packageName}.json`
      );

      const packages = data.packages?.[packageName];
      if (!packages || packages.length === 0) { return null; }

      // First entry is the latest stable version
      const latest = packages.find((p: any) => !p.version.includes('dev') && !p.version.includes('alpha') && !p.version.includes('beta'))
        || packages[0];

      const latestVersion = latest.version || '';
      const lastPublished = latest.time ? new Date(latest.time) : null;

      // Check for vulnerabilities via OSV.dev
      const vulnerabilities = await checkVulnerabilities(packageName, latestVersion, 'composer');

      return { latestVersion, lastPublished, vulnerabilities };
    } catch {
      return null;
    }
  }
}
