import * as fs from 'fs'
import axios from 'axios'
import * as jetpack from "fs-jetpack";
import * as matter from 'gray-matter'
import * as path from 'path'
import * as cheerio from 'cheerio'
import * as readline from 'readline'

import { Configuration, defaultConfiguration, IDocumentOptions } from "./Configuration"
import { Logger, LogLevel } from "./Logger"
import { RevealServer } from "./RevealServer"
import { parseSlides } from "./SlideParser"
import { URL } from 'url';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

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
const getReferencedFiles = async (logger: Logger, baseUrl: string, body: string) => {
    const $ = cheerio.load(body);
    const references = [].concat(
        $('*[href]').map((_, link) => $(link).attr('href')).filter(cheerioLocalFileReference).get()
    ).concat(
        $('*[src]').map((_, link) => $(link).attr('src')).filter(cheerioLocalFileReference).get()
    ).map((relativePath) => (new URL(relativePath, baseUrl)).href)
    logger.log("Found references: " + JSON.stringify(references, null, 2))
    return Promise.allSettled(references.map((path) => {
        return axios.get(path)
    })).then((r) => {
        for (let request of r) {
            const url = (request.status === 'fulfilled' // typescript guard
                ? request?.value?.config?.url
                : request?.reason?.config?.url) || "--missing url data--"
            const successfulRequest = request.status === 'fulfilled'
            const message = `${request.status} - ${url}`
            if (successfulRequest) {
                logger.log(message)
            } else {
                logger.error(message)
            }
        }
        return r
    }).catch(e => {
        console.error("Failed to get referenced files: ", e)
    })
}

const readLineAsync = (message: string): Promise<string> => {
    return new Promise((resolve, _reject) => {
        rl.question(message, (answer: string) => {
            resolve(answer);
            rl.close();
        })
    })
}

const generateBundle = async (logger: Logger, config: Configuration, noQuestions: boolean = false) => {
    const exportPath = getExportPath(config)
    console.log(`Remove files from: ${exportPath}`)
    if (!exportPath) {
        logger.error(`Seemingly missing exportPath: '${exportPath}'`)
        process.exit(1)
    }
    if (jetpack.exists(exportPath)) {
        let shouldContinue = true
        if (!noQuestions) {
            const promptInput = await readLineAsync(`Path (${exportPath}) already exists. The script will erease it's content completely. Do you want to continue? [Y/n] `);
            shouldContinue = promptInput.trim().match(/^([Yy]|\s*)$/) != null
        }
        if (!shouldContinue) {
            logger.error("Path is not empty, and we should not override it. Exiting...")
            process.exit(1)
        }
    }
    await jetpack.removeAsync(exportPath)
    logger.log(`Start to generate presentation to: ${exportPath}`)
    // copy all libs. Might be exhausting, but this makes sure that all plugins work properly
    const copyAllLibsTargetPath = path.join(getExportPath(config), "libs")
    await jetpack.copy(path.join(rootDir, "libs"), copyAllLibsTargetPath)
    logger.log(`Lib files generated... ${copyAllLibsTargetPath}`)
    console.warn("NOTE: Referenced relative files have been copied from `src` and `href` properties. For others, or dynamic ones (in case any) please find a custom solution.")
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
    shouldGenerateBundle: boolean,
    exportLocation: boolean,
    serve: boolean = true,
    port: number = 0,
    debugMode: boolean = false,
    noQuestions: boolean = false,
    debugServer: boolean = false,
    cachePages: boolean = true,
    overrideConfig: any = {}, // should have some keys of IDocumentOptions
) => {
    const presentationWorkingDir = path.join(clientWorkingDir, path.dirname(slideSource))
    logger.log(`Client working dir: ${clientWorkingDir}`) // Where the user started the app
    logger.log(`Presentation working dir: ${presentationWorkingDir}`) // Where the presentation is held, relative paths are originated from there
    logger.log(`Default assets root dir: ${rootDir}`) // Where the assets are available in the installed lib folder
    const documentText = "" + fs.readFileSync(slideSource)
    const overrideConfigValue = exportLocation ? { exportHTMLPath: exportLocation } : {}
    const config: Configuration = { ...documentOptions(defaultConfiguration, documentText), ...overrideConfig, ...overrideConfigValue }
    if (shouldGenerateBundle) {
        await generateBundle(logger, config, noQuestions)
    }
    const server = new RevealServer(
        logger,
        () => presentationWorkingDir, // Static files relative to MD file
        () => parseSlides(slideContent(documentText), config),
        () => config,
        rootDir, // BasePath to extensions, ejs views and libs in this folder
        () => shouldGenerateBundle,
        () => getExportPath(config)
    )
    server.start(Math.abs(port), cachePages, debugServer)
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
            await getReferencedFiles(logger, serverUri, res.data)
            server.stop()
            console.log("Server stopped... Exiting")
        } catch (err) {
            logger.error(`Failed to generate bundle. Error: ${err}`)
        }
        process.exit(0)
    }

}