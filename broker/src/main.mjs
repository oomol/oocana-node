import { listen } from "./listen.mjs";
import minimist from "minimist";

const DEFAULT_PORT = 47688;

const argv = minimist(process.argv.slice(2));
const port = Number(argv.port) || DEFAULT_PORT;
listen(port);
