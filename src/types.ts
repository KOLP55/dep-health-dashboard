/**
 * Core types for Dependency Health Dashboard
 */

export type HealthStatus = 'healthy' | 'outdated' | 'vulnerable' | 'abandoned' | 'unknown';

export type Severity = 'critical' | 'high' | 'moderate' | 'low' | 'info';

export type Ecosystem =
  | 'npm'
  | 'pip'
  | 'composer'
  | 'maven'
  | 'gradle'
  | 'cargo'
  | 'gomod'
  | 'nuget'
  | 'rubygems'
  | 'pub'
  | 'swift';

export interface DependencyInfo {
  name: string;
  currentVersion: string;
  latestVersion: string | null;
  ecosystem: Ecosystem;
  health: HealthStatus;
  vulnerabilities: Vulnerability[];
  lastPublished: Date | null;
  isDev: boolean;
  updateAvailable: boolean;
  filePath: string; // Which manifest file this came from
}

export interface Vulnerability {
  id: string;           // CVE or advisory ID
  title: string;
  severity: Severity;
  description: string;
  fixedIn: string | null;
  url: string;
}

export interface ScanResult {
  ecosystem: Ecosystem;
  filePath: string;
  dependencies: DependencyInfo[];
  scannedAt: Date;
  errors: string[];
}

export interface HealthSummary {
  total: number;
  healthy: number;
  outdated: number;
  vulnerable: number;
  abandoned: number;
  unknown: number;
  criticalVulnerabilities: number;
  ecosystems: Ecosystem[];
}

export interface EcosystemScanner {
  ecosystem: Ecosystem;
  manifestFiles: string[];
  scan(filePath: string): Promise<ScanResult>;
}

export interface RegistryAPI {
  getLatestVersion(packageName: string): Promise<string | null>;
  getPackageInfo(packageName: string): Promise<RegistryPackageInfo | null>;
  getVulnerabilities(packageName: string, version: string): Promise<Vulnerability[]>;
}

export interface RegistryPackageInfo {
  name: string;
  latestVersion: string;
  lastPublished: Date | null;
  description: string;
  homepage: string | null;
  repository: string | null;
  license: string | null;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}
