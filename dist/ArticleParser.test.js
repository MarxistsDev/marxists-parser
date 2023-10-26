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
exports.getUniqueFileName = void 0;
const ArticleParser_1 = __importDefault(require("./ArticleParser"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const worker_threads_1 = require("worker_threads");
function getUniqueFileName(filename, dir = './data', ext = '.json') {
    return __awaiter(this, void 0, void 0, function* () {
        let fileNumber = 1; // Start with 2 to get the desired format like full2.json
        while (true) {
            let newFileName = `${filename}${fileNumber}${ext}`;
            if (fileNumber == 1)
                newFileName = `${filename}${ext}`;
            const newPath = path_1.default.join(dir, newFileName);
            try {
                yield promises_1.default.access(newPath);
                // If this line is reached, the file exists; increment the number and try again.
                fileNumber++;
            }
            catch (err) {
                console.log(err);
                if (err.code === 'ENOENT') {
                    // File does not exist; return the unique filename.
                    return newPath;
                }
                else {
                    throw err; // Handle other errors.
                }
            }
        }
    });
}
exports.getUniqueFileName = getUniqueFileName;
// Usage example:
const FOLDER = './www/';
const OUT = 'full';
const DATA = './data/';
function processFilesInWorker() {
    return __awaiter(this, void 0, void 0, function* () {
        const { files } = worker_threads_1.workerData;
        const articles = [];
        for (const file of files) {
            if (file.endsWith('.htm') || file.endsWith('.html')) {
                const filePath = path_1.default.join(FOLDER, file);
                const html = yield promises_1.default.readFile(filePath, 'utf8');
                articles.push(ArticleParser_1.default.parse(file.replace('.html', '').replace('.htm', ''), html));
            }
        }
        return articles;
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
        if (worker_threads_1.isMainThread) {
            const files = yield getFilesToProcess();
            const numThreads = require('os').cpus().length; // Number of CPU cores
            const chunkSize = Math.ceil(files.length / numThreads);
            const workerPromises = [];
            for (let i = 0; i < numThreads; i++) {
                const start = i * chunkSize;
                const end = start + chunkSize;
                const workerFiles = files.slice(start, end);
                const workerPromise = new Promise((resolve, reject) => {
                    const worker = new worker_threads_1.Worker(__filename, {
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
            const articles = results.reduce((acc, result) => acc.concat(result), []);
            const outFile = yield getUniqueFileName(OUT);
            yield promises_1.default.writeFile(outFile, JSON.stringify(articles, null, 4));
            console.log('JSON data is saved.');
        }
        else {
            const articles = yield processFilesInWorker();
            worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage(articles);
        }
    });
}
main();
