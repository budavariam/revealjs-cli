# Reveal.js CLI server

[![continuous integration workflow](https://github.com/budavariam/revealjs-cli/workflows/continuous%20integration%20workflow/badge.svg)](https://github.com/budavariam/revealjs-cli/actions?query=workflow%3A%22continuous+integration+workflow%22)

[![NODE.JS DEPENDENCIES](https://david-dm.org/budavariam/revealjs-cli/status.svg)](https://david-dm.org/budavariam/revealjs-cli)
[![NODE.JS DEV DEPENDENCIES](https://david-dm.org/budavariam/revealjs-cli/dev-status.svg)](https://david-dm.org/budavariam/revealjs-cli?type=dev)

[![Known Vulnerabilities](https://snyk.io/test/github/budavariam/revealjs-cli/badge.svg?targetFile=package.json)](https://snyk.io/test/github/budavariam/vscode-reveal?targetFile=package.json)

This tool is based on the awesome [VSCode-Reveal](https://github.com/evilz/vscode-reveal).

This is the first tool I've used to create markdown presentations, and I like the way it's put together.
The only thing I missed, was a way to call it from the command line, and have the same output as I do with the extension.

Here you can read [my quick blog post](https://budavariam.github.io/posts/2020/06/01/markdown-slideshow/) about the possibilities of creating slideshows in Markdown.

## Getting started

```text
./dist/revealjs-cli.js --help
Usage: revealjs-cli [options]

Options:
  -d, --debug              log additional debug info
  -p, --port <port>        serve app on specifict port
  -b, --build              save the generated presentation to the path specified in `exportHTMLPath`
  -s, --serve              serve app on a random port
  -r, --refresh            do not cache generated template
  -c, --config <location>  config json file to override default values
  -o, --open <location>    source of the starter markdown file
  -h, --help               output usage information
```

You must specify the `--open` flag to load a markdown file for generation.
You can find examples in the [examples](./examples) folder.

You may set the `--build` flag to keep the generated files.
In case you do not specify a `--port`, and the `--serve` flag is not set either, then a build bundle is created even if the `--build` flag is not set.

Under the hood, it currently uses the same engine as [VSCode-Reveal](https://github.com/evilz/vscode-reveal).

For contributions getting started see [dev docs](./README-DEV.md).

## Features

- [Markdown](#markdown)
- [Theme](#theme)
- [Highlight Theme](#highlight)
- [Reveal.js Options](#options)
- [YAML Front Matter](#frontmatter)
- [Plugins](#plugins)
- [FAQ](#faq)

## <a id="markdown"></a> Markdown

Create reveal.js presentation directly from markdown file,
open or create a new file in markdown and use default slide separator to see slide counter change in the status bar and title appear in the sidebar.

Since Reveal.js use marked to parse the markdown string you can use this in your document:

- GitHub flavored markdown.
- GFM tables

If you need a sample file you can get it here:
https://raw.githubusercontent.com/budavariam/revealjs-cli/master/examples/sample/sample.md

## <a id="theme"></a> Theme

reveal.js comes with a few themes built in:

- Black (default)
- White
- League
- Sky
- Beige
- Simple
- Serif
- Blood
- Night
- Moon
- Solarized

You can set it using `revealjs.theme` parameter in Vs code config or in the document itself using front matter.

If you want a custom theme you can do it!
Just add custom style to a CSS file in the same folder that your markdown.

example:
if your file name is `my-theme.css` just add this in the front matter header :

```
---
customTheme : "my-theme"
---
```

Note that you can use both theme and custom theme at the same time. Your custom theme will be loaded after to override default reveal.js theme.

## <a id="highlight"></a> Highlight Theme

You can use code block in your markdown that will be highlighted by highlight.js.
So you can configure the coloration theme by setting `revealjs.highlightTheme` parameter of VS Code, or set it using front matter.

```
---
highlightTheme : "other theme"
---
```

Get the theme list here https://highlightjs.org/

## <a id="options"></a> Reveal.js Options

You can customize many setting on for your reveal.js presentation.

|Name|Description|Default|
|--- |--- |--- |
`revealjs.notesSeparator`|Revealjs markdown note delimiter|`note:`|
`revealjs.theme`|Revealjs Theme (black, white, league, beige, sky, night, serif, simple, solarized|`black`|
`revealjs.highlightTheme`|Highlight Theme|`Zenburn`|
`revealjs.controls`|Display controls in the bottom right corner|`true`|
`revealjs.progress`|Display a presentation progress bar|`true`|
`revealjs.slideNumber`|Display the page number of the current slide||
`revealjs.history`|Push each slide change to the browser history||
`revealjs.keyboard`|Enable keyboard shortcuts for navigation|`true`|
`revealjs.overview`|Enable the slide overview mode|`true`|
`revealjs.center`|Vertical centering of slides|`true`|
`revealjs.touch`|Enables touch navigation on devices with touch input|`true`|
`revealjs.loop`|Loop the presentation||
`revealjs.rtl`|Change the presentation direction to be RTL||
`revealjs.shuffle`|Randomizes the order of slides each time the presentation loads||
`revealjs.fragments`|Turns fragments on and off globally|`true`|
`revealjs.embedded`|Flags if the presentation is running in an embedded mode, i.e. contained within a limited portion of the screen||
`revealjs.help`|Flags if we should show a help overlay when the questionmark key is pressed|`true`|
`revealjs.showNotes`|Flags if speaker notes should be visible to all viewers||
`revealjs.autoSlide`|Number of milliseconds between automatically proceeding to the next slide, disabled when set to 0, this value can be overwritten by using a data-autoslide attribute on your slides||
`revealjs.autoSlideMethod`|The direction in which the slides will move whilst autoslide is activated|`Reveal.navigateNext`|
`revealjs.autoSlideStoppable`|Stop auto-sliding after user input|`true`|
`revealjs.mouseWheel`|Enable slide navigation via mouse wheel||
`revealjs.hideAddressBar`|Hides the address bar on mobile devices|`true`|
`revealjs.previewLinks`|Opens links in an iframe preview overlay||
`revealjs.transition`|Transition style (none/fade/slide/convex/concave/zoom)|`default`|
`revealjs.transitionSpeed`|Transition speed (default/fast/slow)|`default`|
`revealjs.backgroundTransition`|Transition style for full page slide backgrounds (none/fade/slide/convex/concave/zoom)|`default`|
`revealjs.viewDistance`|Number of slides away from the current that are visible|`3`|
`revealjs.parallaxBackgroundImage`|Parallax background image||
`revealjs.parallaxBackgroundSize`|Parallax background size (CSS syntax, e.g. 2100px 900px)||
`revealjs.parallaxBackgroundHorizontal`|Number of pixels to move the parallax background per slide||
`revealjs.parallaxBackgroundVertical`|Number of pixels to move the parallax background per slide||

<table>
<tr>
        <td>
            <code>revealjs.separator</code>
        </td>
        <td>Revealjs markdown slide separator</td>
        <td>
            <code>^(
?|
)---(
?|
)$</code>
        </td>
    </tr>
    <tr>
        <td>
            <code>revealjs.verticalSeparator</code>
        </td>
        <td>Revealjs markdown vertical separator</td>
        <td>
            <code>^(
?|
)--(
?|
)$</code>
        </td>
    </tr>
</table>

---


## <a id="frontmatter"></a> YAML Front Matter

You can change settings directly in your markdown file using front matter style. You can change all extention settings like this :

```
---
theme : "white"
transition: "zoom"
---
```

> Note do not add `revealjs.` prefix before setting name.

## <a id="plugins"></a> Plugins

### Disable slideout menu

```
---
enableMenu: false
---
```

### Disable chalkboard

```
---
enableChalkboard: false
---
```

### Disable title footer

```
---
enableTitleFooter: false
---
```

### Disable zoom

```
---
enableZoom: false
---
```

### Disable search

```
---
enableSearch: false
---
```

## <a id="faq"></a> FAQ

> Note : The first time, Windows will ask you about the firewall. If you open the port for the application, you can see your presentation remotely.

## Known Issues

Please add issues on [Github](https://github.com/budavariam/revealjs-cli/issues/new).
