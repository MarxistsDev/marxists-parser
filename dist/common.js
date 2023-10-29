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
exports.getFileWithHighestIncrement = exports.getUniqueFileName = void 0;
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
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
function getFileWithHighestIncrement(baseName, extension, directory = './') {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let highestIncrement = -1;
            let highestIncrementedFile = null;
            const files = yield promises_1.default.readdir(directory);
            const regex = new RegExp(`${baseName}(\\d+)?${extension}`);
            for (const file of files) {
                if (file === `${baseName}${extension}`) {
                    highestIncrementedFile = file;
                }
                if (regex.test(file)) {
                    const match = file.match(regex);
                    if (match && match[1]) {
                        const increment = parseInt(match[1], 10);
                        if (increment > highestIncrement) {
                            highestIncrement = increment;
                            highestIncrementedFile = file;
                        }
                    }
                }
            }
            return highestIncrementedFile;
        }
        catch (error) {
            console.error('Error while getting the highest increment file:', error);
            return null;
        }
    });
}
exports.getFileWithHighestIncrement = getFileWithHighestIncrement;
