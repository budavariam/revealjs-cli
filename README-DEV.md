# Dev guide

## Getting started for development

- Install dependencies: `npm install`
- Run dev server: `npm webpack-dev`
- Start the app server with e.g: `node dist/revealjs-cli.js ./examples/features/sample.md`
- Open the server url that is printed

## Publish

- Install dependencies: `npm install`
- Prod build: `npm run build`
- Publish with version bump: `npm run npmpublish`.
    (I can not simply use publish, because npm install triggers prepublish for some reason instead of preinstall)
