# Change Log

All notable changes to this project will be documented in this file.

This extension's inspiration was based on the npm menu featured in the JetBrains WebStorm IDE. It's a Visual Studio Code addon that adds a tree view in your explorer view. It shows all scripts defined in the package.json file of your project and allows you to run them with a single click.
Check the extensions settings if you want to change package manager.

## [Unreleased]

- Initial release

## [1.1.0]

- Added refresh option
- Changed from png icons to built in Codicon's

## [1.2.0]

- Fixed the titles for all settings options
- Package manager setting is now a dropdown selection menu
- Added an option to change how the menu runs commands, by command or name
- Added an option to hide updated package.json balloon messages
- When opening a new project folder that contains a package.json, NPM Menu will notify you through a balloon if you haven't installed any dependencies and ask you if you want to install them
- When changes in a package.json is detected where the dependencies are missmatching (missing, updated version, removed etc.) NPM Menu will display a balloon asking if you want to install the changes

## [1.2.1]

- Fixed an issue where on run time the plugin expects there to be a package.json even if there isn't