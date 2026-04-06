/**
 * Lightweight semver comparison utilities.
 * Falls back to string comparison for non-semver versions.
 */

export interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
  prerelease: string;
  raw: string;
}

const SEMVER_REGEX = /^[v~^>=<\s]*(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:-(.+))?$/;

export function parseVersion(version: string): ParsedVersion | null {
  const match = version.trim().match(SEMVER_REGEX);
  if (!match) { return null; }

  return {
    major: parseInt(match[1], 10),
    minor: match[2] ? parseInt(match[2], 10) : 0,
    patch: match[3] ? parseInt(match[3], 10) : 0,
    prerelease: match[4] || '',
    raw: version.trim(),
  };
}

/**
 * Clean version constraint to get the actual version.
 * e.g., "^1.2.3" → "1.2.3", ">=2.0" → "2.0", "~3.1.0" → "3.1.0"
 */
export function cleanVersion(versionConstraint: string): string {
  return versionConstraint.replace(/^[\^~>=<!\s]+/, '').trim();
}

/**
 * Compare two version strings.
 * Returns: -1 if a < b, 0 if equal, 1 if a > b
 */
export function compareVersions(a: string, b: string): number {
  const va = parseVersion(a);
  const vb = parseVersion(b);

  if (!va || !vb) {
    return a.localeCompare(b);
  }

  if (va.major !== vb.major) { return va.major - vb.major; }
  if (va.minor !== vb.minor) { return va.minor - vb.minor; }
  if (va.patch !== vb.patch) { return va.patch - vb.patch; }

  // Prerelease versions have lower precedence
  if (va.prerelease && !vb.prerelease) { return -1; }
  if (!va.prerelease && vb.prerelease) { return 1; }

  return va.prerelease.localeCompare(vb.prerelease);
}

export function isOutdated(current: string, latest: string): boolean {
  return compareVersions(cleanVersion(current), cleanVersion(latest)) < 0;
}
