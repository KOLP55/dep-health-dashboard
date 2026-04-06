import { BaseScanner } from './base-scanner';
import { Ecosystem, Vulnerability } from '../types';
import { fetchJSON } from '../utils/http';
import { checkVulnerabilities } from '../utils/vuln-checker';

/**
 * Scanner for JavaScript/Node.js projects (package.json → npm registry + OSV.dev vulnerabilities)
 */
export class NpmScanner extends BaseScanner {
  readonly ecosystem: Ecosystem = 'npm';
  readonly manifestFiles = ['**/package.json'];

  parseManifest(content: string, filePath: string) {
    const pkg = JSON.parse(content);
    const deps: { name: string; version: string; isDev: boolean }[] = [];

    if (pkg.dependencies) {
      for (const [name, version] of Object.entries(pkg.dependencies)) {
        deps.push({ name, version: String(version), isDev: false });
      }
    }

    if (pkg.devDependencies) {
      for (const [name, version] of Object.entries(pkg.devDependencies)) {
        deps.push({ name, version: String(version), isDev: true });
      }
    }

    return deps;
  }

  async fetchPackageInfo(packageName: string) {
    try {
      // npm registry API (free, no auth needed)
      const encodedName = encodeURIComponent(packageName);
      const data = await fetchJSON<any>(`https://registry.npmjs.org/${encodedName}`);

      const latestVersion = data['dist-tags']?.latest || '';
      const lastPublished = data.time?.[latestVersion]
        ? new Date(data.time[latestVersion])
        : null;

      // Check vulnerabilities via OSV.dev
      const vulnerabilities = await checkVulnerabilities(packageName, latestVersion, 'npm');

      return { latestVersion, lastPublished, vulnerabilities };
    } catch {
      return null;
    }
  }
}
