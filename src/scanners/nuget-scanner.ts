import { BaseScanner } from './base-scanner';
import { Ecosystem, Vulnerability } from '../types';
import { fetchJSON } from '../utils/http';

/**
 * Scanner for .NET/C# projects (.csproj → NuGet API)
 */
export class NugetScanner extends BaseScanner {
  readonly ecosystem: Ecosystem = 'nuget';
  readonly manifestFiles = ['**/*.csproj'];

  parseManifest(content: string, filePath: string) {
    const deps: { name: string; version: string; isDev: boolean }[] = [];

    // Match <PackageReference Include="Name" Version="1.0.0" />
    const regex = /<PackageReference\s+Include="([^"]+)"\s+Version="([^"]+)"/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      deps.push({
        name: match[1],
        version: match[2],
        isDev: false,
      });
    }

    return deps;
  }

  async fetchPackageInfo(packageName: string) {
    try {
      const lowerName = packageName.toLowerCase();
      const data = await fetchJSON<any>(
        `https://api.nuget.org/v3-flatcontainer/${lowerName}/index.json`
      );

      const versions = data.versions || [];
      const latestVersion = versions[versions.length - 1] || '';

      // Get detailed metadata for last published date
      const metaData = await fetchJSON<any>(
        `https://api.nuget.org/v3/registration5-gz-semver2/${lowerName}/index.json`
      ).catch(() => null);

      let lastPublished: Date | null = null;
      if (metaData?.items?.[0]?.items) {
        const lastItem = metaData.items[metaData.items.length - 1];
        const lastEntry = lastItem.items?.[lastItem.items.length - 1];
        if (lastEntry?.catalogEntry?.published) {
          lastPublished = new Date(lastEntry.catalogEntry.published);
        }
      }

      return { latestVersion, lastPublished, vulnerabilities: [] };
    } catch {
      return null;
    }
  }
}
