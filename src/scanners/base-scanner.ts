import * as vscode from 'vscode';
import { DependencyInfo, Ecosystem, HealthStatus, ScanResult, Vulnerability } from '../types';
import { globalCache } from '../utils/cache';
import { batchFetch } from '../utils/http';
import { checkVulnerabilities } from '../utils/vuln-checker';

/**
 * Base scanner that all ecosystem scanners extend.
 * Handles common logic: caching, health classification, vulnerability checking.
 */
export abstract class BaseScanner {
  abstract readonly ecosystem: Ecosystem;
  abstract readonly manifestFiles: string[];

  /**
   * Parse the manifest file and extract dependency names + versions.
   */
  abstract parseManifest(content: string, filePath: string): { name: string; version: string; isDev: boolean }[];

  /**
   * Fetch latest version and metadata from the ecosystem registry.
   */
  abstract fetchPackageInfo(packageName: string): Promise<{
    latestVersion: string;
    lastPublished: Date | null;
    vulnerabilities: Vulnerability[];
  } | null>;

  /**
   * Find all manifest files in the workspace.
   */
  async findManifests(): Promise<vscode.Uri[]> {
    const allUris: vscode.Uri[] = [];
    // Exclude dependency/build folders that contain their own manifest files
    const excludePattern = '{**/node_modules/**,**/vendor/**,**/venv/**,**/.venv/**,**/env/**,**/__pycache__/**,**/target/**,**/build/**,**/dist/**,**/.git/**,**/storage/**,**/bootstrap/cache/**}';
    for (const pattern of this.manifestFiles) {
      const uris = await vscode.workspace.findFiles(pattern, excludePattern);
      allUris.push(...uris);
    }
    return allUris;
  }

  /**
   * Full scan: parse manifest → fetch registry info → classify health.
   */
  async scan(filePath: string): Promise<ScanResult> {
    const errors: string[] = [];
    const dependencies: DependencyInfo[] = [];

    try {
      const fileUri = vscode.Uri.file(filePath);
      const content = (await vscode.workspace.fs.readFile(fileUri)).toString();
      const parsed = this.parseManifest(content, filePath);

      // Batch fetch all package info with concurrency control
      const results = await batchFetch(
        parsed,
        async (dep) => {
          const cacheKey = `${this.ecosystem}:${dep.name}`;
          const cached = globalCache.get<any>(cacheKey);
          if (cached) { return cached; }

          const info = await this.fetchPackageInfo(dep.name);
          // If scanner didn't find vulns, fallback to OSV.dev
          if (info && info.vulnerabilities.length === 0) {
            try {
              info.vulnerabilities = await checkVulnerabilities(
                dep.name, dep.version, this.ecosystem
              );
            } catch { /* ignore OSV failures */ }
          }
          if (info) { globalCache.set(cacheKey, info); }
          return info;
        },
        5 // max 5 concurrent API calls
      );

      for (const dep of parsed) {
        const info = results.get(dep);

        if (!info || info instanceof Error) {
          dependencies.push({
            name: dep.name,
            currentVersion: dep.version,
            latestVersion: null,
            ecosystem: this.ecosystem,
            health: 'unknown',
            vulnerabilities: [],
            lastPublished: null,
            isDev: dep.isDev,
            updateAvailable: false,
            filePath,
          });
          if (info instanceof Error) {
            errors.push(`${dep.name}: ${info.message}`);
          }
          continue;
        }

        const health = this.classifyHealth(dep.version, info);
        const { isOutdated } = require('../utils/version');

        dependencies.push({
          name: dep.name,
          currentVersion: dep.version,
          latestVersion: info.latestVersion,
          ecosystem: this.ecosystem,
          health,
          vulnerabilities: info.vulnerabilities,
          lastPublished: info.lastPublished,
          isDev: dep.isDev,
          updateAvailable: info.latestVersion ? isOutdated(dep.version, info.latestVersion) : false,
          filePath,
        });
      }
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }

    return {
      ecosystem: this.ecosystem,
      filePath,
      dependencies,
      scannedAt: new Date(),
      errors,
    };
  }

  /**
   * Classify the health of a dependency.
   */
  private classifyHealth(
    currentVersion: string,
    info: { latestVersion: string; lastPublished: Date | null; vulnerabilities: Vulnerability[] }
  ): HealthStatus {
    // Vulnerabilities = top priority
    if (info.vulnerabilities.length > 0) {
      return 'vulnerable';
    }

    // Check if abandoned (no update in 2+ years)
    const abandonedDays = vscode.workspace.getConfiguration('depHealth').get<number>('abandonedThresholdDays', 730);
    if (info.lastPublished) {
      const daysSinceUpdate = (Date.now() - info.lastPublished.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate > abandonedDays) {
        return 'abandoned';
      }
    }

    // Check if outdated
    const { isOutdated } = require('../utils/version');
    if (isOutdated(currentVersion, info.latestVersion)) {
      return 'outdated';
    }

    return 'healthy';
  }
}
