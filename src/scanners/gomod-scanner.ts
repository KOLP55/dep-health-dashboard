import { BaseScanner } from './base-scanner';
import { Ecosystem, Vulnerability } from '../types';
import { fetchJSON } from '../utils/http';

/**
 * Scanner for Go projects (go.mod → Go proxy API)
 */
export class GoModScanner extends BaseScanner {
  readonly ecosystem: Ecosystem = 'gomod';
  readonly manifestFiles = ['**/go.mod'];

  parseManifest(content: string, filePath: string) {
    const deps: { name: string; version: string; isDev: boolean }[] = [];
    let inRequireBlock = false;

    for (const line of content.split('\n')) {
      const trimmed = line.trim();

      if (trimmed === 'require (') {
        inRequireBlock = true;
        continue;
      }
      if (trimmed === ')') {
        inRequireBlock = false;
        continue;
      }

      // Single-line require
      const singleMatch = trimmed.match(/^require\s+(\S+)\s+(\S+)/);
      if (singleMatch) {
        deps.push({ name: singleMatch[1], version: singleMatch[2], isDev: false });
        continue;
      }

      // Inside require block
      if (inRequireBlock) {
        const blockMatch = trimmed.match(/^(\S+)\s+(\S+)/);
        if (blockMatch && !blockMatch[1].startsWith('//')) {
          deps.push({
            name: blockMatch[1],
            version: blockMatch[2].replace(/\/\/.*$/, '').trim(),
            isDev: trimmed.includes('// indirect'),
          });
        }
      }
    }

    return deps;
  }

  async fetchPackageInfo(packageName: string) {
    try {
      // Go module proxy API (free, no auth)
      const encodedName = encodeURIComponent(packageName);
      const data = await fetchJSON<any>(
        `https://proxy.golang.org/${packageName}/@latest`
      );

      const latestVersion = data.Version || '';
      const lastPublished = data.Time ? new Date(data.Time) : null;

      return { latestVersion, lastPublished, vulnerabilities: [] };
    } catch {
      return null;
    }
  }
}
