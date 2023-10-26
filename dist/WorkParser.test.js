"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const WorkParser_1 = require("./WorkParser");
const common_1 = require("./common");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const FOLDER = './authors/';
const DATA = './data/';
const OUT = 'work';
function processFilesInWorker() {
    return __awaiter(this, void 0, void 0, function* () {
        const { files } = workerData;
        const data = [];
        for (const file of files) {
            if (file.endsWith('.htm') || file.endsWith('.html')) {
                const filePath = path_1.default.join(FOLDER, file);
                const html = yield promises_1.default.readFile(filePath, 'utf8');
                data.push(yield (0, WorkParser_1.works)(file.replace('.', '/').replace('/htm', '.htm'), html));
            }
        }
        return data;
    });
}
function getFilesToProcess() {
    return __awaiter(this, void 0, void 0, function* () {
        const files = yield promises_1.default.readdir(FOLDER);
        return files;
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        if (isMainThread) {
            const files = yield getFilesToProcess();
            const numThreads = require('os').cpus().length; // Number of CPU cores
            const chunkSize = Math.ceil(files.length / numThreads);
            const workerPromises = [];
            for (let i = 0; i < numThreads; i++) {
                const start = i * chunkSize;
                const end = start + chunkSize;
                const workerFiles = files.slice(start, end);
                const workerPromise = new Promise((resolve, reject) => {
                    const worker = new Worker(__filename, {
                        workerData: { files: workerFiles },
                    });
                    worker.on('message', resolve);
                    worker.on('error', reject);
                    worker.on('exit', (code) => {
                        if (code !== 0) {
                            reject(new Error(`Worker stopped with exit code ${code}`));
                        }
                    });
                });
                workerPromises.push(workerPromise);
            }
            const results = yield Promise.all(workerPromises);
            const data = results.reduce((acc, result) => acc.concat(result), []);
            const outFile = yield (0, common_1.getUniqueFileName)(OUT, DATA);
            yield promises_1.default.writeFile(outFile, JSON.stringify(data, null, 4));
            console.log('JSON data is saved.');
        }
        else {
            const data = yield processFilesInWorker();
            parentPort.postMessage(data);
        }
    });
}
main();
