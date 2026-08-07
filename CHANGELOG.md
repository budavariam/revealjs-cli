<!-- markdownlint-disable MD033 MD024 -->

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- 
Reminder for types of changes: 

`Added` for new features.
`Changed` for changes in existing functionality.
`Deprecated` for soon-to-be removed features.
`Removed` for now removed features.
`Fixed` for any bug fixes.
`Security` in case of vulnerabilities. 
-->

## [Unreleased]

- Handle missing starter markdown file

## [0.0.10] - 2026-08-07

### Fixed

- Speaker view previewed the wrong slide at vertical stack boundaries: standing
  on the last subslide of a stack, the "Upcoming" pane could show the next
  stack's remembered subslide (`data-previous-indexv`) instead of its top
  slide, because the preview iframe ran `next()` on itself while holding its
  own per-stack position memory. The preview now navigates to an explicit
  target computed from the presenter window's `availableFragments`/
  `availableRoutes` (fragment steps still forward `next()`; `navigationMode:
  'grid'` keeps its vertical index). Same bug is still open upstream as
  [reveal.js#3831](https://github.com/hakimel/reveal.js/issues/3831).

## [0.0.9] - 2026-01-19

### Changed

- Updated bundled mermaid.js to 11.12.2, with better error handling for broken diagrams

## [0.0.8] - 2026-01-19

### Fixed

- Removed a stray `anything.js` reference from the mermaid.js plugin bundle

## [0.0.7] - 2025-11-25

### Fixed

- `title-footer` plugin referenced a wrong asset path after the reveal.js upgrade

## [0.0.6] - 2025-11-20

Revival release after five years — mostly toolchain modernisation and publish-workflow debugging.

### Changed

- Upgraded bundled reveal.js from 3.8.0 to 3.9.2 (3.8.0 bundle removed)
- Extracted plugin configs and paths for easier maintenance
- Modernised dependencies and build toolchain (webpack 5, commander 12, axios 1, cheerio 1, Node 20+); replaced `@evilz/markdown-it-attrs` with upstream `markdown-it-attrs`
- Publish flow now runs a production build before the version bump (`prenpmpublish`)

## [0.0.5] - 2020-12-17

## Changed

- Reduced dependency size by not bundling all dependencies together.

## [0.0.4] - 2020-12-17

## Fixed

- Set custom location did not accept value from `location` flag

## [0.0.3] - 2020-12-17

## Added

- Make it selectable to print ejb debug logs

## Fixed

- Make it work for relative paths from the server

## Changed

- Better format log messages for referenced relative files
- Make it clear that bundle creation clears out the target folder

## 0.0.1 - 2020-12-15

Getting started from [VSCode Reveal:4.0.3](https://github.com/evilz/vscode-reveal/blob/master/CHANGELOG.md)

### Fix

- Webpack warnings

### Added

- CLI options
- Extract modules from VSCode extension

[Unreleased]: https://github.com/budavariam/revealjs-cli/compare/v0.0.10...HEAD
[0.0.10]: https://github.com/budavariam/revealjs-cli/compare/v0.0.9...v0.0.10
[0.0.9]: https://github.com/budavariam/revealjs-cli/compare/v0.0.8...v0.0.9
[0.0.8]: https://github.com/budavariam/revealjs-cli/compare/v0.0.7...v0.0.8
[0.0.7]: https://github.com/budavariam/revealjs-cli/compare/v0.0.6...v0.0.7
[0.0.6]: https://github.com/budavariam/revealjs-cli/compare/v0.0.5...v0.0.6
[0.0.5]: https://github.com/budavariam/revealjs-cli/compare/v0.0.4...v0.0.5
[0.0.4]: https://github.com/budavariam/revealjs-cli/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/budavariam/revealjs-cli/compare/v0.0.1...v0.0.3
