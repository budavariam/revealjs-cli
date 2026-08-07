# Dev guide

## Getting started for development

- Install dependencies: `npm install`
- Run dev server: `npm run webpack-dev`
- Start the app server with e.g: `node dist/revealjs-cli.js --open ./examples/features/sample.md --serve --port 62268`
- Open the server url that is printed

## Publish

- Update `CHANGELOG.md` first:
    - Add a `## [X.Y.Z] - YYYY-MM-DD` section for the version that `npm version patch` is about to create (current `package.json` version + 1 patch), moving finished items out of `[Unreleased]`
    - Add the compare link at the bottom (`[X.Y.Z]: .../compare/vPREV...vX.Y.Z`) and point `[Unreleased]` at the new tag
    - Commit the changelog before publishing so the version-bump commit and tag include it
- Install dependencies: `npm install`
- Prod build: `npm run build`
- Login to npm with the proper credentials: `npm login`
- Publish with version bump: `npm run npmpublish`
    (I can not simply use `publish`, because npm install triggers `prepublish` for some reason instead of `preinstall`)
- Push the new tags for github: `npm push --tags`
