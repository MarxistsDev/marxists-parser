import ArticleParser, { Article } from "./ArticleParser";
import fs from 'fs/promises';
import path from 'path';

export async function getUniqueFileName(filename:string, dir:string = './data', ext:string='.json') {
  let fileNumber = 1; // Start with 2 to get the desired format like full2.json

  while (true) {
    let newFileName = `${filename}${fileNumber}${ext}`;
    if(fileNumber == 1)
      newFileName = `${filename}${ext}`;
    const newPath = path.join(dir, newFileName);

    try {
      await fs.access(newPath);
      // If this line is reached, the file exists; increment the number and try again.
      fileNumber++;
    } catch (err:any) {
      console.log(err);
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
const DATA = './data/';
const FOLDER = './www/';
const OUT = 'full';

const processFiles = async() => {
    let articles:Article[] = []; 
    try {
      const files = await fs.readdir(FOLDER);
  
      for (const file of files) {
        if (file.endsWith('.htm') || file.endsWith('.html')) {
          const html = await fs.readFile(FOLDER + file, 'utf8');
          articles.push(ArticleParser.parse(file.replace('.html', '').replace('.htm', ''), html));
        }
      }
      const outFile = await getUniqueFileName(OUT);
      await fs.writeFile(DATA + outFile, JSON.stringify(articles, null, 4));
      console.log('JSON data is saved.');
    } catch (err) {
      console.error(err);
    }
}
  
processFiles();