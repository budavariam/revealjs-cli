import packageInfo from "../package.json"
import * as fs from "fs"
import * as path from "path"
import { Command } from 'commander';

import { initLogger, loadConfigFile, main } from "./cli";
import { LogLevel } from "./Logger";

const program = new Command()

program
    .option('-d, --debug', 'log additional debug info')
    .option('-e, --debugserver', 'log ejb debug info')
    .option('-p, --port <port>', 'serve app on specifict port')
    .option('-b, --build', 'save the generated presentation to the path specified in `exportHTMLPath` config value')
    .option('-l, --location <location>', 'save the generated presentation to the path specified. This is the strongest setting.')
    .option('-y, --yes', 'answer yes to every prompt')
    .option('-s, --serve', 'serve app on a random port')
    .option('-r, --refresh', 'do not cache generated template')
    .option('-c, --config <location>', 'config json file to override default values')
    .option('-o, --open <location>', 'source of the starter markdown file')

program.version(packageInfo.version)
program.parse(process.argv);

const options = program.opts();
const debugMode = options.debug
const debugServer = options.debugserver

if (debugMode) {
    console.log("=== RevealJS CLI Debug Mode ===")
    console.log("Version:", packageInfo.version)
    console.log("Node version:", process.version)
    console.log("Platform:", process.platform)
    console.log("Current working directory:", process.cwd())
    console.log("Script directory:", __dirname)
    console.log("\nCommand line options:", options)
    console.log("Process arguments:", process.argv)
}

const logger = initLogger(debugMode ? LogLevel.Verbose : LogLevel.Error)
const port = options.port ? options.port : 0
const slideSource = options.open || ""
const serve = options.port >= 0 || options.serve || false
const generateBundle = options.build || !options.serve || false
const cachePages = !options.refresh
const noQuestions = options.yes

if (debugMode) {
    console.log("\n=== Configuration ===")
    console.log("Slide source:", slideSource)
    console.log("Port:", port)
    console.log("Serve mode:", serve)
    console.log("Generate bundle:", generateBundle)
    console.log("Cache pages:", cachePages)
    console.log("No questions:", noQuestions)
}

if (!slideSource) {
    console.error("ERROR: Please specify a markdown file to open with --open parameter. More info: --help")
    if (debugMode) {
        console.error("Debug: slideSource is empty or undefined")
    }
    process.exit(1)
}

const resolvedSlideSource = path.isAbsolute(slideSource) ? slideSource : path.resolve(process.cwd(), slideSource)

if (debugMode) {
    console.log("\n=== File Access Check ===")
    console.log("Original path:", slideSource)
    console.log("Resolved path:", resolvedSlideSource)
    console.log("File exists:", fs.existsSync(resolvedSlideSource))
}

if (!fs.existsSync(resolvedSlideSource)) {
    console.error(`ERROR: Starter markdown file '${slideSource}' is not accessible.`)
    console.error(`Resolved path: ${resolvedSlideSource}`)
    if (debugMode) {
        console.error("\nDebug: Attempted paths:")
        console.error("  - Relative to CWD:", path.resolve(process.cwd(), slideSource))
        console.error("  - Absolute check:", path.isAbsolute(slideSource))
        try {
            const dirname = path.dirname(resolvedSlideSource)
            console.error("  - Parent directory exists:", fs.existsSync(dirname))
            if (fs.existsSync(dirname)) {
                console.error("  - Parent directory contents:", fs.readdirSync(dirname).slice(0, 10))
            }
        } catch (e) {
            console.error("  - Error checking parent directory:", e.message)
        }
    }
    process.exit(1)
}

const overrideConfig = loadConfigFile(options.config || "")
const exportLocation = options.location

if (debugMode) {
    console.log("\n=== Starting main process ===")
    console.log("Override config:", overrideConfig ? Object.keys(overrideConfig) : "none")
    console.log("Export location:", exportLocation || "default")
}

// Wrap main in error handler for better debugging
try {
    main(
        logger,
        slideSource,
        generateBundle,
        exportLocation,
        serve,
        port,
        debugMode,
        noQuestions,
        debugServer,
        cachePages,
        overrideConfig,
    ).catch((error) => {
        console.error("\n=== FATAL ERROR ===")
        console.error("An unexpected error occurred during execution:")
        console.error(error.message)
        if (debugMode) {
            console.error("\nStack trace:")
            console.error(error.stack)
            console.error("\nError details:")
            console.error(error)
        }
        process.exit(1)
    })
} catch (error) {
    console.error("\n=== FATAL ERROR (Synchronous) ===")
    console.error("An unexpected error occurred during startup:")
    console.error(error.message)
    if (debugMode) {
        console.error("\nStack trace:")
        console.error(error.stack)
        console.error("\nError details:")
        console.error(error)
    }
    process.exit(1)
}