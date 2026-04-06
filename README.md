# Dependency Health Dashboard

**Stop running `npm audit`, `composer audit`, `pip audit` manually.** See everything in one visual dashboard, across all your projects, automatically.

[![VS Code Marketplace](https://vsmarketplacebadges.dev/version-short/benjdiasaad.dep-health-dashboard.svg)](https://marketplace.visualstudio.com/items?itemName=benjdiasaad.dep-health-dashboard)
[![Downloads](https://vsmarketplacebadges.dev/downloads-short/benjdiasaad.dep-health-dashboard.svg)](https://marketplace.visualstudio.com/items?itemName=benjdiasaad.dep-health-dashboard)
[![Rating](https://vsmarketplacebadges.dev/rating-short/benjdiasaad.dep-health-dashboard.svg)](https://marketplace.visualstudio.com/items?itemName=benjdiasaad.dep-health-dashboard)

## What It Does

Dependency Health Dashboard scans your project's dependencies and shows you instantly which packages are:

- **Vulnerable** (known security issues)
- **Outdated** (newer versions available)
- **Abandoned** (no updates in 2+ years)
- **Healthy** (up to date and secure)

All in a clean sidebar panel with color-coded indicators — no terminal commands needed.

## Supported Ecosystems (10+)

| Ecosystem | Manifest File | Registry |
|-----------|--------------|----------|
| JavaScript/Node.js | `package.json` | npm |
| Python | `requirements.txt`, `pyproject.toml`, `Pipfile` | PyPI |
| PHP/Laravel | `composer.json` | Packagist |
| Java/Spring | `pom.xml` | Maven Central |
| Gradle | `build.gradle`, `build.gradle.kts` | Maven Central |
| Rust | `Cargo.toml` | crates.io |
| Go | `go.mod` | Go Proxy |
| .NET/C# | `*.csproj` | NuGet |

More ecosystems coming soon: Ruby, Dart/Flutter, Swift.

## Features

- **Auto-scan on project open** — no need to run anything manually
- **Sidebar dashboard** — red/orange/yellow/green health indicators at a glance
- **Status bar summary** — quick health overview always visible
- **One-click updates** — update packages directly from the dashboard
- **File watchers** — re-scans automatically when you modify dependency files
- **Ignore list** — skip packages you don't want to track
- **Zero API keys required** — uses free public registry APIs
- **Multi-project support** — works with monorepos and multi-language projects

## How to Use

1. Install the extension
2. Open any project with dependency files (`package.json`, `composer.json`, `pom.xml`, etc.)
3. The dashboard appears in the sidebar automatically
4. Click the refresh icon to re-scan at any time

## Commands

| Command | Description |
|---------|-------------|
| `Dep Health: Scan Dependencies` | Manually trigger a full scan |
| `Dep Health: Update Package` | Update a specific package to latest |
| `Dep Health: Update All Packages` | Update all outdated packages |
| `Dep Health: Show Full Health Report` | View detailed report |
| `Dep Health: Ignore Package` | Add a package to the ignore list |

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `depHealth.autoScanOnOpen` | `true` | Scan when project opens |
| `depHealth.scanInterval` | `3600` | Auto-scan interval in seconds |
| `depHealth.ignoredPackages` | `[]` | Packages to skip |
| `depHealth.enabledEcosystems` | all | Which ecosystems to scan |
| `depHealth.abandonedThresholdDays` | `730` | Days to consider abandoned |
| `depHealth.showStatusBarSummary` | `true` | Show status bar indicator |

## Why This Extension?

| Feature | npm audit | composer audit | This Extension |
|---------|-----------|---------------|----------------|
| Visual dashboard | No | No | Yes |
| Auto-scan | No | No | Yes |
| Multi-ecosystem | No | No | 10+ ecosystems |
| One-click update | No | No | Yes |
| Abandoned detection | No | No | Yes |
| Zero config | No | No | Yes |

## Contributing

Contributions are welcome! Feel free to open issues or submit PRs on [GitHub](https://github.com/benjdiasaad/dep-health-dashboard).

## License

MIT
