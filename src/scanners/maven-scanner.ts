import { BaseScanner } from './base-scanner';
import { Ecosystem, Vulnerability } from '../types';
import { fetchJSON } from '../utils/http';

/**
 * Scanner for Java/Spring projects (pom.xml → Maven Central API)
 * Also supports build.gradle via GradleScanner subclass.
 */
export class MavenScanner extends BaseScanner {
  readonly ecosystem: Ecosystem = 'maven';
  readonly manifestFiles = ['**/pom.xml'];

  parseManifest(content: string, filePath: string) {
    const deps: { name: string; version: string; isDev: boolean }[] = [];

    // Simple XML parsing for pom.xml dependencies
    // Using regex for lightweight parsing (fast-xml-parser used for complex cases)
    const depRegex = /<dependency>\s*<groupId>(.*?)<\/groupId>\s*<artifactId>(.*?)<\/artifactId>\s*(?:<version>(.*?)<\/version>)?\s*(?:<scope>(.*?)<\/scope>)?/gs;

    let match;
    while ((match = depRegex.exec(content)) !== null) {
      const groupId = match[1]?.trim();
      const artifactId = match[2]?.trim();
      const version = match[3]?.trim() || 'managed';
      const scope = match[4]?.trim() || 'compile';

      if (groupId && artifactId && version !== 'managed') {
        // Skip property references like ${project.version}
        if (version.startsWith('${')) { continue; }

        deps.push({
          name: `${groupId}:${artifactId}`,
          version,
          isDev: scope === 'test',
        });
      }
    }

    return deps;
  }

  async fetchPackageInfo(packageName: string) {
    try {
      const [groupId, artifactId] = packageName.split(':');
      if (!groupId || !artifactId) { return null; }

      // Maven Central Search API (free, no auth)
      const data = await fetchJSON<any>(
        `https://search.maven.org/solrsearch/select?q=g:"${groupId}"+AND+a:"${artifactId}"&rows=1&wt=json`
      );

      const doc = data.response?.docs?.[0];
      if (!doc) { return null; }

      const latestVersion = doc.latestVersion || '';
      const lastPublished = doc.timestamp ? new Date(doc.timestamp) : null;

      return { latestVersion, lastPublished, vulnerabilities: [] };
    } catch {
      return null;
    }
  }
}

/**
 * Scanner for Gradle projects (build.gradle / build.gradle.kts)
 * Shares Maven Central as the registry.
 */
export class GradleScanner extends BaseScanner {
  readonly ecosystem: Ecosystem = 'gradle';
  readonly manifestFiles = ['**/build.gradle', '**/build.gradle.kts'];

  parseManifest(content: string, filePath: string) {
    const deps: { name: string; version: string; isDev: boolean }[] = [];

    // Match Groovy style: implementation 'group:artifact:version'
    const groovyRegex = /(?:implementation|api|compileOnly|runtimeOnly|testImplementation)\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = groovyRegex.exec(content)) !== null) {
      const parts = match[1].split(':');
      if (parts.length >= 3) {
        deps.push({
          name: `${parts[0]}:${parts[1]}`,
          version: parts[2],
          isDev: match[0].startsWith('test'),
        });
      }
    }

    // Match Kotlin DSL: implementation("group:artifact:version")
    const kotlinRegex = /(?:implementation|api|compileOnly|runtimeOnly|testImplementation)\s*\(\s*"([^"]+)"\s*\)/g;
    while ((match = kotlinRegex.exec(content)) !== null) {
      const parts = match[1].split(':');
      if (parts.length >= 3) {
        deps.push({
          name: `${parts[0]}:${parts[1]}`,
          version: parts[2],
          isDev: match[0].startsWith('test'),
        });
      }
    }

    return deps;
  }

  async fetchPackageInfo(packageName: string) {
    // Reuse Maven Central API
    const mavenScanner = new MavenScanner();
    return mavenScanner.fetchPackageInfo(packageName);
  }
}
