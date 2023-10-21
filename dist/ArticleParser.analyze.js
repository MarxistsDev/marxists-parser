"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
/*async function getFileWithHighestIncrement(baseName: string, extension: string, directory: string = './'): Promise<string | null> {
  try {
    let highestIncrement = -1;
    let highestIncrementedFile = null;

    const files = await fs.readdir(directory);

    for (const file of files) {
      if (file.startsWith(baseName) && file.endsWith(extension)) {
        const regex = new RegExp(`${baseName}(\\d+)?${extension}`);
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
  } catch (error) {
    console.error('Error while getting the highest increment file:', error);
    return null;
  }
}

// Usage example:
const baseName = 'full';
const extension = '.json';*/
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
// Usage example:
const baseName = 'full';
const extension = '.json';
const analyze = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newestFile = yield getFileWithHighestIncrement(baseName, extension);
        console.log(newestFile);
        if (newestFile) {
            console.log(__dirname);
            const { default: jsonFile } = yield Promise.resolve(`${path_1.default.join('..', newestFile)}`).then(s => __importStar(require(s)));
            const listOfMissingContent = jsonFile.filter((x) => x.content === undefined);
            console.table(listOfMissingContent);
            console.log(listOfMissingContent.length);
        }
        else {
            console.error('No JSON file found.');
        }
    }
    catch (error) {
        console.error('Error during analysis:', error);
    }
});
analyze();
