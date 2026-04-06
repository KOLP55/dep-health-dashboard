import * as vscode from 'vscode';
import { DependencyInfo, Ecosystem, HealthStatus, HealthSummary, ScanResult } from '../types';

export class HealthTreeProvider implements vscode.TreeDataProvider<DepTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<DepTreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private scanResults: ScanResult[] = [];

  updateResults(results: ScanResult[]) {
    this.scanResults = results;
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: DepTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: DepTreeItem): DepTreeItem[] {
    if (!element) {
      return this.getRootItems();
    }
    return element.children || [];
  }

  private getRootItems(): DepTreeItem[] {
    const allDeps = this.scanResults.flatMap(r => r.dependencies);
    if (allDeps.length === 0) {
      return [new DepTreeItem('No dependencies scanned yet', 'Click refresh to scan', 'info')];
    }

    // Global summary header
    const ecosystems = [...new Set(allDeps.map(d => d.ecosystem))];
    const summaryItem = new DepTreeItem(
      `${allDeps.length} packages scanned`,
      `${ecosystems.length} ecosystem(s)`,
      'info',
      vscode.TreeItemCollapsibleState.None
    );

    const items: DepTreeItem[] = [summaryItem];

    // Group dependencies by ecosystem
    const ecosystemMap = new Map<Ecosystem, DependencyInfo[]>();
    for (const dep of allDeps) {
      const list = ecosystemMap.get(dep.ecosystem) || [];
      list.push(dep);
      ecosystemMap.set(dep.ecosystem, list);
    }

    // Create ecosystem root nodes
    for (const [ecosystem, deps] of ecosystemMap) {
      const ecosystemLabel = this.getEcosystemLabel(ecosystem);
      const ecosystemItem = new DepTreeItem(
        ecosystemLabel,
        `${deps.length} packages`,
        'info',
        vscode.TreeItemCollapsibleState.Expanded
      );
      ecosystemItem.iconPath = this.getEcosystemIcon(ecosystem);
      ecosystemItem.children = this.getHealthGroups(deps);
      items.push(ecosystemItem);
    }

    return items;
  }

  /**
   * Creates health status sub-groups within an ecosystem.
   */
  private getHealthGroups(deps: DependencyInfo[]): DepTreeItem[] {
    const groups: DepTreeItem[] = [];

    // Vulnerable (red) — expanded by default
    const vulnDeps = deps.filter(d => d.health === 'vulnerable');
    if (vulnDeps.length > 0) {
      const criticalCount = vulnDeps.flatMap(d => d.vulnerabilities).filter(v => v.severity === 'critical').length;
      const vulnItem = new DepTreeItem(
        `${vulnDeps.length} Vulnerable`,
        criticalCount > 0 ? `${criticalCount} critical` : '',
        'vulnerable',
        vscode.TreeItemCollapsibleState.Expanded
      );
      vulnItem.children = vulnDeps.map(d => this.createDepItem(d));
      groups.push(vulnItem);
    }

    // Outdated (orange)
    const outdatedDeps = deps.filter(d => d.health === 'outdated');
    if (outdatedDeps.length > 0) {
      const outdatedItem = new DepTreeItem(
        `${outdatedDeps.length} Outdated`,
        'Updates available',
        'outdated',
        vscode.TreeItemCollapsibleState.Collapsed
      );
      outdatedItem.children = outdatedDeps.map(d => this.createDepItem(d));
      groups.push(outdatedItem);
    }

    // Abandoned (yellow)
    const abandonedDeps = deps.filter(d => d.health === 'abandoned');
    if (abandonedDeps.length > 0) {
      const abandonedItem = new DepTreeItem(
        `${abandonedDeps.length} Possibly Abandoned`,
        'No updates in 2+ years',
        'abandoned',
        vscode.TreeItemCollapsibleState.Collapsed
      );
      abandonedItem.children = abandonedDeps.map(d => this.createDepItem(d));
      groups.push(abandonedItem);
    }

    // Healthy (green)
    const healthyDeps = deps.filter(d => d.health === 'healthy');
    if (healthyDeps.length > 0) {
      const healthyItem = new DepTreeItem(
        `${healthyDeps.length} Healthy`,
        'Up to date',
        'healthy',
        vscode.TreeItemCollapsibleState.Collapsed
      );
      healthyItem.children = healthyDeps.map(d => this.createDepItem(d));
      groups.push(healthyItem);
    }

    // Unknown
    const unknownDeps = deps.filter(d => d.health === 'unknown');
    if (unknownDeps.length > 0) {
      const unknownItem = new DepTreeItem(
        `${unknownDeps.length} Unknown`,
        'Could not determine status',
        'unknown',
        vscode.TreeItemCollapsibleState.Collapsed
      );
      unknownItem.children = unknownDeps.map(d => this.createDepItem(d));
      groups.push(unknownItem);
    }

    return groups;
  }

  private createDepItem(dep: DependencyInfo): DepTreeItem {
    const versionInfo = dep.latestVersion
      ? `${dep.currentVersion} → ${dep.latestVersion}`
      : dep.currentVersion;

    const item = new DepTreeItem(
      dep.name,
      versionInfo,
      dep.health,
      vscode.TreeItemCollapsibleState.None
    );

    item.tooltip = this.buildTooltip(dep);

    // Add update command for outdated packages
    if (dep.updateAvailable) {
      item.command = {
        command: 'depHealth.updatePackage',
        title: 'Update Package',
        arguments: [dep],
      };
    }

    return item;
  }

  private buildTooltip(dep: DependencyInfo): vscode.MarkdownString {
    const md = new vscode.MarkdownString();
    md.appendMarkdown(`**${dep.name}** (${dep.ecosystem})\n\n`);
    md.appendMarkdown(`Current: \`${dep.currentVersion}\`\n\n`);
    if (dep.latestVersion) {
      md.appendMarkdown(`Latest: \`${dep.latestVersion}\`\n\n`);
    }
    if (dep.lastPublished) {
      md.appendMarkdown(`Last published: ${dep.lastPublished.toLocaleDateString()}\n\n`);
    }
    if (dep.vulnerabilities.length > 0) {
      md.appendMarkdown(`---\n\n**Vulnerabilities:**\n\n`);
      for (const v of dep.vulnerabilities) {
        md.appendMarkdown(`- **${v.severity.toUpperCase()}**: ${v.title}\n`);
        if (v.fixedIn) { md.appendMarkdown(`  Fixed in: \`${v.fixedIn}\`\n`); }
      }
    }
    md.isTrusted = true;
    return md;
  }

  /**
   * Human-readable label for each ecosystem.
   */
  private getEcosystemLabel(ecosystem: Ecosystem): string {
    const labels: Record<string, string> = {
      npm: 'NPM',
      pip: 'Python (pip)',
      composer: 'Composer / PHP',
      maven: 'Maven / Java',
      gradle: 'Gradle / Java',
      cargo: 'Cargo / Rust',
      gomod: 'Go Modules',
      nuget: 'NuGet / .NET',
      rubygems: 'RubyGems',
      pub: 'Dart / Flutter',
      swift: 'Swift',
    };
    return labels[ecosystem] || ecosystem;
  }

  /**
   * Ecosystem-specific icons.
   */
  private getEcosystemIcon(ecosystem: Ecosystem): vscode.ThemeIcon {
    switch (ecosystem) {
      case 'npm':
        return new vscode.ThemeIcon('package', new vscode.ThemeColor('charts.red'));
      case 'composer':
        return new vscode.ThemeIcon('package', new vscode.ThemeColor('charts.orange'));
      case 'pip':
        return new vscode.ThemeIcon('package', new vscode.ThemeColor('charts.blue'));
      case 'maven':
      case 'gradle':
        return new vscode.ThemeIcon('package', new vscode.ThemeColor('charts.yellow'));
      case 'cargo':
        return new vscode.ThemeIcon('package', new vscode.ThemeColor('charts.purple'));
      case 'gomod':
        return new vscode.ThemeIcon('package', new vscode.ThemeColor('charts.green'));
      case 'nuget':
        return new vscode.ThemeIcon('package', new vscode.ThemeColor('charts.blue'));
      default:
        return new vscode.ThemeIcon('package');
    }
  }
}

/**
 * Tree item with health-based icons.
 */
export class DepTreeItem extends vscode.TreeItem {
  children?: DepTreeItem[];

  constructor(
    label: string,
    description: string,
    health: HealthStatus | 'info',
    collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None
  ) {
    super(label, collapsibleState);
    this.description = description;
    this.iconPath = this.getIcon(health);
    this.contextValue = health;
  }

  private getIcon(health: HealthStatus | 'info'): vscode.ThemeIcon {
    switch (health) {
      case 'vulnerable':
        return new vscode.ThemeIcon('error', new vscode.ThemeColor('errorForeground'));
      case 'outdated':
        return new vscode.ThemeIcon('warning', new vscode.ThemeColor('editorWarning.foreground'));
      case 'abandoned':
        return new vscode.ThemeIcon('clock', new vscode.ThemeColor('editorWarning.foreground'));
      case 'healthy':
        return new vscode.ThemeIcon('pass', new vscode.ThemeColor('testing.iconPassed'));
      case 'info':
        return new vscode.ThemeIcon('info');
      default:
        return new vscode.ThemeIcon('question');
    }
  }
}
