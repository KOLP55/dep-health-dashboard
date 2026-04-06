import { BaseScanner } from './base-scanner';
import { Ecosystem, Vulnerability } from '../types';
import { fetchJSON } from '../utils/http';

/**
 * Scanner for Rust projects (Cargo.toml → crates.io API)
 */
export class CargoScanner extends BaseScanner {
  readonly ecosystem: Ecosystem = 'cargo';
  readonly manifestFiles = ['**/Cargo.toml'];

  parseManifest(content: string, filePath: string) {
    const deps: { name: string; version: string; isDev: boolean }[] = [];
    let section = '';

    for (const line of content.split('\n')) {
      const trimmed = line.trim();

      if (trimmed.startsWith('[')) {
        section = trimmed;
        continue;
      }

      const isDep = section === '[dependencies]' || section.startsWith('[dependencies.');
      const isDevDep = section === '[dev-dependencies]' || section.startsWith('[dev-dependencies.');

      if (isDep || isDevDep) {
        // Match: name = "version" or name = { version = "..." }
        const simpleMatch = trimmed.match(/^([a-zA-Z0-9_-]+)\s*=\s*"([^"]+)"/);
        if (simpleMatch) {
          deps.push({ name: simpleMatch[1], version: simpleMatch[2], isDev: isDevDep });
          continue;
        }

        const tableMatch = trimmed.match(/^([a-zA-Z0-9_-]+)\s*=\s*\{.*version\s*=\s*"([^"]+)"/);
        if (tableMatch) {
          deps.push({ name: tableMatch[1], version: tableMatch[2], isDev: isDevDep });
        }
      }
    }

    return deps;
  }

  async fetchPackageInfo(packageName: string) {
    try {
      const data = await fetchJSON<any>(
        `https://crates.io/api/v1/crates/${encodeURIComponent(packageName)}`
      );

      const crate = data.crate;
      if (!crate) { return null; }

      const latestVersion = crate.newest_version || '';
      const lastPublished = crate.updated_at ? new Date(crate.updated_at) : null;

      return { latestVersion, lastPublished, vulnerabilities: [] };
    } catch {
      return null;
    }
  }
}
