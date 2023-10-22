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
const ArticleParser_test_1 = require("./ArticleParser.test");
const WorkParser_1 = require("./WorkParser");
const promises_1 = __importDefault(require("fs/promises"));
const FOLDER = './authors/';
const DATA = './data/';
const OUT = 'work';
const processFiles = () => __awaiter(void 0, void 0, void 0, function* () {
    let data = [];
    try {
        const files = yield promises_1.default.readdir(FOLDER);
        for (const file of files) {
            if (file.endsWith('.htm') || file.endsWith('.html')) {
                const html = yield promises_1.default.readFile(FOLDER + file, 'utf8');
                data.push(yield (0, WorkParser_1.works)(file.replace('.', '/').replace('/htm', '.htm'), html));
            }
        }
        const outFile = yield (0, ArticleParser_test_1.getUniqueFileName)(OUT, DATA);
        yield promises_1.default.writeFile(outFile, JSON.stringify(data, null, 4));
        console.log('JSON data is saved.');
    }
    catch (err) {
        console.error(err);
    }
});
processFiles();
