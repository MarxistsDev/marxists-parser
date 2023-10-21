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
const ArticleParser_1 = __importDefault(require("./ArticleParser"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
function getUniqueFileName(originalPath) {
    return __awaiter(this, void 0, void 0, function* () {
        let filename = path_1.default.basename(originalPath);
        const dir = path_1.default.dirname(originalPath);
        let fileNumber = 2; // Start with 2 to get the desired format like full2.json
        while (true) {
            const baseName = path_1.default.basename(filename, path_1.default.extname(filename));
            const extension = path_1.default.extname(filename);
            const newFileName = `${baseName}${fileNumber}${extension}`;
            const newPath = path_1.default.join(dir, newFileName);
            try {
                yield promises_1.default.access(newPath);
                // If this line is reached, the file exists; increment the number and try again.
                fileNumber++;
            }
            catch (err) {
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
// Usage example:
const FOLDER = './www/';
const OUT = 'full.json';
const processFiles = () => __awaiter(void 0, void 0, void 0, function* () {
    let articles = [];
    try {
        const files = yield promises_1.default.readdir(FOLDER);
        for (const file of files) {
            if (file.endsWith('.htm') || file.endsWith('.html')) {
                const html = yield promises_1.default.readFile(`${FOLDER}${file}`, 'utf8');
                articles.push(ArticleParser_1.default.parse(file.replace('.html', '').replace('.htm', ''), html));
            }
        }
        const outFile = yield getUniqueFileName(OUT);
        yield promises_1.default.writeFile(outFile, JSON.stringify(articles, null, 4));
        console.log('JSON data is saved.');
    }
    catch (err) {
        console.error(err);
    }
});
processFiles();
