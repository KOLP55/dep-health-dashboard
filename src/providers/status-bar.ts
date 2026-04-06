import * as vscode from 'vscode';
import { DependencyInfo } from '../types';

/**
 * Status bar item showing a quick health summary.
 * Example: "$(shield) 3 vuln · 12 outdated · 45 healthy"
 */
export class StatusBarProvider {
  private statusBarItem: vscode.StatusBarItem;

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      50
    );
    this.statusBarItem.command = 'depHealth.scan';
    this.statusBarItem.tooltip = 'Click to scan dependencies';
    this.statusBarItem.text = '$(shield) Dep Health: Ready';
    this.statusBarItem.show();
  }

  update(deps: DependencyInfo[]) {
    const vulnerable = deps.filter(d => d.health === 'vulnerable').length;
    const outdated = deps.filter(d => d.health === 'outdated').length;
    const healthy = deps.filter(d => d.health === 'healthy').length;

    const parts: string[] = [];

    if (vulnerable > 0) {
      parts.push(`$(error) ${vulnerable} vuln`);
    }
    if (outdated > 0) {
      parts.push(`$(warning) ${outdated} outdated`);
    }
    parts.push(`$(pass) ${healthy} healthy`);

    this.statusBarItem.text = `$(shield) ${parts.join(' · ')}`;

    if (vulnerable > 0) {
      this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
    } else if (outdated > 0) {
      this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    } else {
      this.statusBarItem.backgroundColor = undefined;
    }

    this.statusBarItem.tooltip = `Dependencies: ${deps.length} total\n${vulnerable} vulnerable, ${outdated} outdated, ${healthy} healthy\n\nClick to re-scan`;
  }

  setScanning() {
    this.statusBarItem.text = '$(loading~spin) Scanning dependencies...';
  }

  dispose() {
    this.statusBarItem.dispose();
  }
}
