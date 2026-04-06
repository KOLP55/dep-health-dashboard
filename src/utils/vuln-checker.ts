import { Vulnerability, Ecosystem } from '../types';
import { postJSON } from './http';
import { globalCache } from './cache';

/**
 * OSV.dev ecosystem mapping.
 * Maps our ecosystem names to OSV.dev ecosystem names.
 */
const OSV_ECOSYSTEM_MAP: Record<string, string> = {
  npm: 'npm',
  pip: 'PyPI',
  composer: 'Packagist',
  maven: 'Maven',
  gradle: 'Maven',
  cargo: 'crates.io',
  gomod: 'Go',
  nuget: 'NuGet',
  rubygems: 'RubyGems',
  pub: 'Pub',
};

interface OsvVuln {
  id: string;
  summary?: string;
  details?: string;
  severity?: Array<{ type: string; score: string }>;
  affected?: Array<{
    ranges?: Array<{
      type: string;
      events: Array<{ introduced?: string; fixed?: string }>;
    }>;
  }>;
  references?: Array<{ type: string; url: string }>;
}

interface OsvResponse {
  vulns?: OsvVuln[];
}

/**
 * Check vulnerabilities for a package using OSV.dev API.
 * Free, no auth required, supports all major ecosystems.
 * https://osv.dev/docs/
 */
export async function checkVulnerabilities(
  packageName: string,
  version: string,
  ecosystem: Ecosystem
): Promise<Vulnerability[]> {
  const osvEcosystem = OSV_ECOSYSTEM_MAP[ecosystem];
  if (!osvEcosystem) { return []; }

  // Clean version string (remove ^, ~, >=, etc.)
  const cleanVer = version.replace(/^[\^~>=<!\s]+/, '').split(',')[0].trim();
  if (!cleanVer || cleanVer === '*') { return []; }

  // Check cache first
  const cacheKey = `vuln:${ecosystem}:${packageName}:${cleanVer}`;
  const cached = globalCache.get<Vulnerability[]>(cacheKey);
  if (cached) { return cached; }

  try {
    const response = await postJSON<OsvResponse>(
      'https://api.osv.dev/v1/query',
      {
        version: cleanVer,
        package: {
          name: packageName,
          ecosystem: osvEcosystem,
        },
      },
      8000
    );

    const vulns: Vulnerability[] = (response.vulns || []).map(v => {
      // Determine severity
      let severity: 'critical' | 'high' | 'moderate' | 'low' | 'info' = 'moderate';
      if (v.severity && v.severity.length > 0) {
        const score = parseFloat(v.severity[0].score || '0');
        if (score >= 9.0) { severity = 'critical'; }
        else if (score >= 7.0) { severity = 'high'; }
        else if (score >= 4.0) { severity = 'moderate'; }
        else { severity = 'low'; }
      } else {
        // Try to infer from ID prefix or summary
        const summary = (v.summary || '').toLowerCase();
        if (summary.includes('critical')) { severity = 'critical'; }
        else if (summary.includes('high')) { severity = 'high'; }
        else if (summary.includes('low')) { severity = 'low'; }
      }

      // Find fixed version
      let fixedIn: string | null = null;
      if (v.affected) {
        for (const aff of v.affected) {
          if (aff.ranges) {
            for (const range of aff.ranges) {
              const fixEvent = range.events?.find(e => e.fixed);
              if (fixEvent?.fixed) {
                fixedIn = fixEvent.fixed;
                break;
              }
            }
          }
          if (fixedIn) { break; }
        }
      }

      // Find URL
      const url = v.references?.find(r => r.type === 'ADVISORY')?.url
        || v.references?.find(r => r.type === 'WEB')?.url
        || v.references?.[0]?.url
        || '';

      return {
        id: v.id,
        title: v.summary || v.id,
        severity,
        description: v.details || v.summary || '',
        fixedIn,
        url,
      };
    });

    // Cache for 1 hour
    globalCache.set(cacheKey, vulns, 3600);
    return vulns;
  } catch (e) {
    console.error(`OSV.dev query failed for ${packageName}@${cleanVer}:`, e);
    return [];
  }
}
