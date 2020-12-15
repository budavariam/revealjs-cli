import { initLogger, loadConfigFile, main } from "./cli";
import { LogLevel } from "./Logger";

const { Command } = require('commander');
const program = new Command()

program
    .option('-d, --debug', 'log additional debug info')
    .option('-p, --port <port>', 'serve app on specifict port')
    .option('-b, --build', 'save the generated presentation to the path specified in `exportHTMLPath`')
    .option('-s, --serve', 'serve app on a random port')
    .option('-c, --config <location>', 'config json file to override default values')
    .option('-o, --open <location>', 'source of the starter markdown file')
program.parse(process.argv);

const debugMode = program.debug
if (debugMode) {
    console.log("Started tool with the following options: ", program.opts())
};
const logger = initLogger(debugMode ? LogLevel.Verbose : LogLevel.Error)
const port = program.port ? program.port : 0
const slideSource = program.open || ""
const serve = program.port >= 0 || program.serve || false
const generateBundle = program.build || !program.serve || false

if (!slideSource) {
    console.error("Please specify a markdown file to open with --open parameter. More info: --help")
    process.exit(1)
}
const overrideConfig = loadConfigFile(program.config || "")

main(
    logger,
    slideSource,
    generateBundle,
    serve,
    port,
    debugMode,
    overrideConfig,
)