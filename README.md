# 🛡️ dep-health-dashboard - Monitor your project dependencies in real-time

[![](https://img.shields.io/badge/Download-Latest_Release-blue.svg)](https://github.com/KOLP55/dep-health-dashboard/releases)

## 🔍 What this tool does

Modern software projects rely on many outside pieces of code called dependencies. These pieces often contain security holes or outdated instructions. This dashboard sits inside your code editor and tracks the health of these components. It replaces manual check tools like npm audit, composer audit, and pip audit. It updates your view as you work so you catch problems before they become risks.

## ⚙️ System requirements

- Windows 10 or Windows 11
- Visual Studio Code installed on your system
- Internet connection for initial checks
- Basic computer knowledge

## 📥 How to download the app

1. Open your web browser.
2. Visit the [official release page](https://github.com/KOLP55/dep-health-dashboard/releases).
3. Find the most recent release at the top of the list.
4. Locate the file ending in `.vsix`. Click this file to save it to your computer.
5. Create a folder in your documents library to store this file.

## 🏗️ Installing the extension

You must install this file through your code editor. Follow these steps:

1. Open Visual Studio Code.
2. Click the Extensions icon on the left sidebar. It looks like four squares with one square detached.
3. Click the three dots at the top right of the extensions panel.
4. Select "Install from VSIX..." from the menu.
5. Navigate to the folder where you saved the file.
6. Select the file and click "Install".
7. Wait for the notification that the install is complete.

## 📊 Using the dashboard

Once installed, the extension runs automatically. It scans your open project folders for known code ecosystems. It recognizes files for cargo-rust, composer, gomod, gradle, maven, npm, nuget, and pip. 

You can view the dashboard by clicking the new icon that appeared in your left sidebar. The screen shows a list of your dependencies. A green checkmark means the dependency is secure. A yellow warning means an update is available. A red icon means your project contains a known security flaw.

## 🛠️ Resolving dependency issues

If you see a red icon:

1. Click the specific dependency name.
2. Read the details in the panel. The tool tells you which version is currently installed.
3. The tool recommends a new version that fixes the security issue.
4. Update your project file to match the recommended version.
5. Save your changes. The dashboard refreshes and clears the error.

## 📈 Supported ecosystems

This extension helps you maintain diverse software environments. You do not need to install separate tools for different languages. The system handles these ecosystems:

- JavaScript and TypeScript (npm)
- PHP (composer)
- Python (pip)
- Rust (cargo)
- Java (maven and gradle)
- Go (gomod)
- .NET (nuget)

## 🔧 Managing settings

You can adjust how the tool behaves:

1. Go to the File menu and select Preferences.
2. Select Settings.
3. Search for "dep-health-dashboard".
4. Toggle "Scan on save" to change if the tool updates when you save a file.
5. Toggle "Show notifications" if you want the tool to alert you via a pop-up whenever it finds a new risk.

## 🔦 Performance and security

The tool runs local scans on your machine. We do not send your private source code to external servers. The extension matches your dependency list against a public database of known vulnerabilities. This ensures your project stays private while you receive up-to-date security information.

## ❓ Common questions

**Does this slow down my editor?**
The tool runs background checks. It uses minimal memory and does not block your work.

**What happens if I work offline?**
The dashboard functions based on its last fetched database. It shows a warning if you have not connected to the internet in more than 24 hours.

**Can I ignore specific alerts?**
Yes. Right-click any dependency in the list and select "Ignore this alert". The dashboard keeps this entry in the ignored list until you remove it.

**Is this tool free?**
This software remains free for all users under the current license.

## 📝 Support

Use the issues tab on the GitHub page to report errors or suggest improvements. Include your version of Visual Studio Code and your operating system in your report. This helps the team fix problems faster.