import fs from 'fs/promises';
import path from 'path';
import { Article, Note } from "./ArticleParser";


async function getFileWithHighestIncrement(baseName: string, extension: string, directory: string = './'): Promise<string | null> {
  try {
    let highestIncrement = -1;
    let highestIncrementedFile = null;

    const files = await fs.readdir(directory);
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
  } catch (error) {
    console.error('Error while getting the highest increment file:', error);
    return null;
  }
}

// Usage example:
const baseName = 'full';
const extension = '.json';
const DATA = './data/';

const analyze = async () => {
  try {
    const newestFile = await getFileWithHighestIncrement(baseName, extension, DATA);
    console.log(newestFile);
    if (newestFile) {
      const { default: jsonFile } = await import(path.join('..', DATA, newestFile));
      const listOfMissingContent = jsonFile.filter((x:Article) => x.content === undefined);
      console.table(listOfMissingContent);
      console.log(listOfMissingContent.length);
    } else {
      console.error('No JSON file found.');
    }
  } catch (error) {
    console.error('Error during analysis:', error);
  }
}

analyze();
