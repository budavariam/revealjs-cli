import * as fs from 'fs'
import axios from 'axios'
import * as jetpack from "fs-jetpack";
import * as matter from 'gray-matter'
import * as path from 'path'
import * as cheerio from 'cheerio'

import { Configuration, defaultConfiguration, IDocumentOptions } from "./Configuration"
import { Logger, LogLevel } from "./Logger"
import { RevealServer } from "./RevealServer"
import { parseSlides } from "./SlideParser"
import { URL } from 'url';

const rootDir = path.join(__dirname, "..")
const clientWorkingDir = process.cwd()

const getExportPath = (config) => {
    return path.isAbsolute(config.exportHTMLPath)
        ? config.exportHTMLPath
        : path.join(clientWorkingDir, config.exportHTMLPath)
}

const slideContent = (documentText): string => {
    return matter(documentText).content
}

const frontMatter = (documentText: string): any => {
    return matter(documentText).data
}

const documentOptions = (defaultConfig, documentText: string): IDocumentOptions => {
    const front = frontMatter(documentText)
    // tslint:disable-next-line:no-object-literal-type-assertion
    return { ...defaultConfig, ...front } as IDocumentOptions
}

const getUri = (server): string | null => {
    if (!server.isListening) {
        return null
    }
    const serverUri = server.uri
    // POSSIBLE PARAMS: `${serverUri}#/${slidepos.horizontal}/${slidepos.vertical}/${Date.now()}
    return `${serverUri}`
}

const exportPDFUri = (server) => {
    const uri = getUri(server)
    return uri + '?print-pdf-now'
}

const showHints = () => {
    const hints: any = {};
    hints["Select slide carousel"] = 'o / ESC'
    hints["Prev slide"] = 'p / h'
    hints["Next slide"] = 'n / l'
    hints["Fullscreen mode"] = 'f'
    hints["Download chalkboard"] = 'd'
    hints["Speaker view"] = 's'
    hints["Toggle drawing"] = 'c'
    hints["Chalkboard"] = 'b'
    hints["Pause presentation"] = 'v'
    hints["Table of contents"] = 'm'
    console.table(hints);
}

/**
 * I consider a path a local file if it does not start with `#`, `?` or `http`
 * 
 * @param _ index of the item
 * @param e url path src/href
 */
const cheerioLocalFileReference = (_: number, e: string) => e && !e.match(/^#|\?|http/)

/**
 * I assume that the generated index.html contains links to all referenced files.
 * 
 * The server has a middleware that saves all visited files to the export folder.
 * All I need is to trigger all of the referenced files, load them, and they will be exported.
 * 
 * A simpler way would be to open it in a browser, but this seems 
 * 
 * @param baseUrl url of the server that exportst the presentation
 * @param body HTML of the root of the presentation
 */
const getReferencedFiles = async (baseUrl: string, body: string) => {
    const $ = cheerio.load(body);
    const references = [].concat(
        $('*[href]').map((_, link) => $(link).attr('href')).filter(cheerioLocalFileReference).get()
    ).concat(
        $('*[src]').map((_, link) => $(link).attr('src')).filter(cheerioLocalFileReference).get()
    ).map((relativePath) => (new URL(relativePath, baseUrl)).href)
    console.log(references)

    return Promise.allSettled(references.map((path) => {
        return axios.get(path)
    }))
}

export const initLogger = (logLevel: LogLevel): Logger => new Logger(logLevel, (e) => { console.log(e) })
export const loadConfigFile = (path: string): any => {
    if (!path) {
        return {}
    }
    try {
        const file = "" + fs.readFileSync(path)
        return JSON.parse(file)
    } catch (err) {
        console.error("Failed to load config file from path %s, error: %s ", path, err)
    }
    return {}
}

export const main = async (
    logger: Logger,
    slideSource: string,
    generateBundle: boolean,
    serve: boolean = true,
    port: number = 0,
    debugMode: boolean = false,
    cachePages: boolean = true,
    overrideConfig: any = {}, // should have some keys of IDocumentOptions
) => {
    logger.log(`Client working dir: ${clientWorkingDir}`)
    logger.log(`Default assets root dir: ${rootDir}`)
    const documentText = "" + fs.readFileSync(slideSource)
    const config: Configuration = { ...documentOptions(defaultConfiguration, documentText), ...overrideConfig }
    if (generateBundle) {
        const exportPath = getExportPath(config)
        console.log(`Remove files from: ${exportPath}`)
        await jetpack.removeAsync(exportPath)
        console.log(`Start to generate presentation to: ${exportPath}`)
        // copy all libs. Might be exhausting, but this makes sure that all plugins work properly
        const targetPath = path.join(getExportPath(config), "libs")
        await jetpack.copy(path.join(rootDir, "libs"), targetPath)
        // console.log(`Lib files generated... ${targetPath}`)
        console.warn("NOTE: Referenced relative files have been copied from `src` and `href` properties, for others, or dynamic ones please find a custom solution.")
    }
    const server = new RevealServer(
        logger,
        () => clientWorkingDir, // Static files relative to MD file
        () => parseSlides(slideContent(documentText), config),
        () => config,
        rootDir, // BasePath to extensions, ejs views and libs in this folder
        () => generateBundle,
        () => getExportPath(config)
    )
    server.start(Math.abs(port), cachePages, debugMode)
    const serverUri = getUri(server) || ""
    showHints()
    if (serve) {
        console.log(`Serving slides at: ${serverUri}`)
        console.log(`Use this url to export (print) pdf: ${exportPDFUri(server)}`)
        //console.log(`Speaker view served from: ${serverUri}libs/reveal.js/3.8.0/plugin/notes/notes.html (NEEDS TO OPEN WITH SHORTCUT)`)
    } else if (!serve) {
        try {
            // force ejs to generate main file
            const res = await axios.get(serverUri);
            console.log(`index.html generated... ${serverUri} response status: ${res.status}`)
            await getReferencedFiles(serverUri, res.data)
            server.stop()
            console.log("Server stopped... Exiting")
        } catch (err) {
            logger.error(`Failed to generate bundle. Error: ${err}`)
        }
        process.exit(0)
    }

}