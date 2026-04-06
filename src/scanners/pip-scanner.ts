import { BaseScanner } from './base-scanner';
import { Ecosystem, Vulnerability } from '../types';
import { fetchJSON } from '../utils/http';
import { checkVulnerabilities } from '../utils/vuln-checker';

/**
 * Scanner for Python projects (requirements.txt, pyproject.toml, Pipfile → PyPI API + OSV.dev)
 */
export class PipScanner extends BaseScanner {
  readonly ecosystem: Ecosystem = 'pip';
  readonly manifestFiles = ['**/requirements.txt', '**/requirements*.txt', '**/pyproject.toml', '**/Pipfile'];

  parseManifest(content: string, filePath: string) {
    if (filePath.endsWith('pyproject.toml')) {
      return this.parsePyproject(content);
    }
    if (filePath.endsWith('Pipfile')) {
      return this.parsePipfile(content);
    }
    return this.parseRequirements(content);
  }

  private parseRequirements(content: string) {
    const deps: { name: string; version: string; isDev: boolean }[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-')) { continue; }

      const match = trimmed.match(/^([a-zA-Z0-9_.-]+)\s*([><=~!]+)\s*([^\s;,#]+)/);
      if (match) {
        deps.push({ name: match[1], version: match[3], isDev: false });
      } else {
        const nameOnly = trimmed.match(/^([a-zA-Z0-9_.-]+)/);
        if (nameOnly) {
          deps.push({ name: nameOnly[1], version: '*', isDev: false });
        }
      }
    }

    return deps;
  }

  private parsePyproject(content: string) {
    const deps: { name: string; version: string; isDev: boolean }[] = [];

    const depsMatch = content.match(/\[project\][\s\S]*?dependencies\s*=\s*\[([\s\S]*?)\]/);
    if (depsMatch) {
      const items = depsMatch[1].match(/"([^"]+)"/g) || [];
      for (const item of items) {
        const clean = item.replace(/"/g, '');
        const match = clean.match(/^([a-zA-Z0-9_.-]+)\s*([><=~!]+)\s*(.+)/);
        if (match) {
          deps.push({ name: match[1], version: match[3], isDev: false });
        }
      }
    }

    return deps;
  }

  private parsePipfile(content: string) {
    const deps: { name: string; version: string; isDev: boolean }[] = [];

    let inPackages = false;
    let inDevPackages = false;

    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed === '[packages]') { inPackages = true; inDevPackages = false; continue; }
      if (trimmed === '[dev-packages]') { inDevPackages = true; inPackages = false; continue; }
      if (trimmed.startsWith('[')) { inPackages = false; inDevPackages = false; continue; }

      if (inPackages || inDevPackages) {
        const match = trimmed.match(/^([a-zA-Z0-9_.-]+)\s*=\s*"([^"]+)"/);
        if (match) {
          deps.push({
            name: match[1],
            version: match[2] === '*' ? '*' : match[2],
            isDev: inDevPackages,
          });
        }
      }
    }

    return deps;
  }

  async fetchPackageInfo(packageName: string) {
    try {
      const data = await fetchJSON<any>(
        `https://pypi.org/pypi/${encodeURIComponent(packageName)}/json`
      );

      const latestVersion = data.info?.version || '';
      const releases = data.releases?.[latestVersion];
      const lastPublished = releases?.[0]?.upload_time
        ? new Date(releases[0].upload_time)
        : null;

      // Check vulnerabilities via OSV.dev
      const vulnerabilities = await checkVulnerabilities(packageName, latestVersion, 'pip');

      return { latestVersion, lastPublished, vulnerabilities };
    } catch {
      return null;
    }
  }
}
