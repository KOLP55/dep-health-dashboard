import * as vscode from 'vscode';
import { getAllScanners } from './scanners';
import { HealthTreeProvider } from './providers/health-tree-provider';
import { StatusBarProvider } from './providers/status-bar';
import { globalCache } from './utils/cache';
import { ScanResult, DependencyInfo } from './types';

let treeProvider: HealthTreeProvider;
let statusBar: StatusBarProvider;

export function activate(context: vscode.ExtensionContext) {
  console.log('Dependency Health Dashboard activated');

  // Initialize providers
  treeProvider = new HealthTreeProvider();
  statusBar = new StatusBarProvider();

  // Register tree view
  const treeView = vscode.window.createTreeView('depHealthOverview', {
    treeDataProvider: treeProvider,
    showCollapseAll: true,
  });

  // Register commands
  const scanCommand = vscode.commands.registerCommand('depHealth.scan', () => runScan());

  const updateCommand = vscode.commands.registerCommand('depHealth.updatePackage', async (dep: DependencyInfo) => {
    if (!dep) { return; }
    const terminal = vscode.window.createTerminal('Dep Health Update');
    terminal.show();

    switch (dep.ecosystem) {
      case 'npm':
        terminal.sendText(`npm install ${dep.name}@latest`);
        break;
      case 'pip':
        terminal.sendText(`pip install --upgrade ${dep.name}`);
        break;
      case 'composer':
        terminal.sendText(`composer update ${dep.name}`);
        break;
      case 'maven':
      case 'gradle':
        vscode.window.showInformationMessage(
          `Update ${dep.name} to ${dep.latestVersion} in your build file.`
        );
        break;
      case 'cargo':
        terminal.sendText(`cargo update -p ${dep.name}`);
        break;
      case 'gomod':
        terminal.sendText(`go get ${dep.name}@latest`);
        break;
      case 'nuget':
        terminal.sendText(`dotnet add package ${dep.name}`);
        break;
    }
  });

  const updateAllCommand = vscode.commands.registerCommand('depHealth.updateAll', async () => {
    const confirm = await vscode.window.showWarningMessage(
      'Update all outdated packages?',
      'Yes',
      'Cancel'
    );
    if (confirm !== 'Yes') { return; }
    vscode.commands.executeCommand('depHealth.scan');
  });

  const showReportCommand = vscode.commands.registerCommand('depHealth.showReport', async () => {
    vscode.window.showInformationMessage('Full health report coming in v1.1!');
  });

  const ignoreCommand = vscode.commands.registerCommand('depHealth.ignorePackage', async (dep: DependencyInfo) => {
    if (!dep) { return; }
    const config = vscode.workspace.getConfiguration('depHealth');
    const ignored = config.get<string[]>('ignoredPackages', []);
    ignored.push(dep.name);
    await config.update('ignoredPackages', ignored, vscode.ConfigurationTarget.Workspace);
    vscode.window.showInformationMessage(`${dep.name} will be ignored in future scans.`);
    runScan();
  });

  // Register disposables
  context.subscriptions.push(
    treeView,
    scanCommand,
    updateCommand,
    updateAllCommand,
    showReportCommand,
    ignoreCommand,
    statusBar
  );

  // Auto-scan on open if enabled
  const config = vscode.workspace.getConfiguration('depHealth');
  if (config.get<boolean>('autoScanOnOpen', true)) {
    // Delay to let VS Code finish loading
    setTimeout(() => runScan(), 3000);
  }

  // Watch for manifest file changes
  const watcher = vscode.workspace.createFileSystemWatcher(
    '**/{package.json,requirements.txt,composer.json,pom.xml,build.gradle,Cargo.toml,go.mod,*.csproj}'
  );
  watcher.onDidChange(() => runScan());
  watcher.onDidCreate(() => runScan());
  watcher.onDidDelete(() => runScan());
  context.subscriptions.push(watcher);

  // Periodic re-scan
  const scanInterval = config.get<number>('scanInterval', 3600);
  if (scanInterval > 0) {
    const interval = setInterval(() => runScan(), scanInterval * 1000);
    context.subscriptions.push({ dispose: () => clearInterval(interval) });
  }
}

async function runScan() {
  statusBar.setScanning();

  const config = vscode.workspace.getConfiguration('depHealth');
  const enabledEcosystems = config.get<string[]>('enabledEcosystems', []);
  const ignoredPackages = config.get<string[]>('ignoredPackages', []);

  const scanners = getAllScanners().filter(
    s => enabledEcosystems.length === 0 || enabledEcosystems.includes(s.ecosystem)
  );

  const allResults: ScanResult[] = [];

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Scanning dependencies...',
      cancellable: true,
    },
    async (progress, token) => {
      for (const scanner of scanners) {
        if (token.isCancellationRequested) { break; }

        progress.report({ message: `Checking ${scanner.ecosystem} packages...` });

        try {
          const manifests = await scanner.findManifests();
          for (const manifest of manifests) {
            if (token.isCancellationRequested) { break; }
            const result = await scanner.scan(manifest.fsPath);

            // Filter out ignored packages
            result.dependencies = result.dependencies.filter(
              d => !ignoredPackages.includes(d.name)
            );

            if (result.dependencies.length > 0) {
              allResults.push(result);
            }
          }
        } catch (e) {
          console.error(`Error scanning ${scanner.ecosystem}:`, e);
        }
      }
    }
  );

  // Update UI
  treeProvider.updateResults(allResults);
  const allDeps = allResults.flatMap(r => r.dependencies);
  statusBar.update(allDeps);

  // Show notification for critical issues
  const vulnCount = allDeps.filter(d => d.health === 'vulnerable').length;
  if (vulnCount > 0) {
    vscode.window.showWarningMessage(
      `Dependency Health: Found ${vulnCount} vulnerable package(s)!`,
      'Show Details'
    ).then(choice => {
      if (choice === 'Show Details') {
        vscode.commands.executeCommand('depHealthOverview.focus');
      }
    });
  }
}

export function deactivate() {
  globalCache.clear();
}
