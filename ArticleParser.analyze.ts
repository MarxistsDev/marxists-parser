import fs from 'fs/promises';
import path from 'path';
import { Article, Note } from "./ArticleParser";
import { getFileWithHighestIncrement } from './common';

// Usage example:
const baseName = 'article';
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
