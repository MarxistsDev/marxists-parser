import { error } from "console";
import ArticleParser, { Article } from "./ArticleParser";
import fs from 'fs/promises';
import path from 'path';

async function getUniqueFileName(originalPath:string) {
  let filename = path.basename(originalPath);
  const dir = path.dirname(originalPath);
  let fileNumber = 2; // Start with 2 to get the desired format like full2.json

  while (true) {
    const baseName = path.basename(filename, path.extname(filename));
    const extension = path.extname(filename);
    const newFileName = `${baseName}${fileNumber}${extension}`;
    const newPath = path.join(dir, newFileName);

    try {
      await fs.access(newPath);
      // If this line is reached, the file exists; increment the number and try again.
      fileNumber++;
    } catch (err:any) {
      if (err.code === 'ENOENT') {
        // File does not exist; return the unique filename.
        return newPath;
      } else {
        throw err; // Handle other errors.
      }
    }
  }
}

// Usage example:
const FOLDER = './www/';
const OUT = 'full.json';

const processFiles = async() => {
    let articles:Article[] = []; 
    try {
      const files = await fs.readdir(FOLDER);
  
      for (const file of files) {
        if (file.endsWith('.htm') || file.endsWith('.html')) {
          const html = await fs.readFile(`${FOLDER}${file}`, 'utf8');
          articles.push(ArticleParser.parse(file.replace('.html', '').replace('.htm', ''), html));
        }
      }
      const outFile = await getUniqueFileName(OUT);
      await fs.writeFile(outFile, JSON.stringify(articles, null, 4));
      console.log('JSON data is saved.');
    } catch (err) {
      console.error(err);
    }
}
  
processFiles();