import { getUniqueFileName } from './ArticleParser.test';
import { Data, works } from './WorkParser';
import fs from 'fs/promises';
import path from 'path';

const FOLDER = './authors/';
const DATA = './data/';
const OUT = 'work';

const processFiles = async() => {
    let data:{}[] = []; 
    try {
      const files = await fs.readdir(FOLDER);
  
      for (const file of files) {
        if (file.endsWith('.htm') || file.endsWith('.html')) {
          const html = await fs.readFile(FOLDER + file, 'utf8');
          data.push(await works(file.replace('.','/').replace('/htm', '.htm'), html));
        }
      }
      const outFile = await getUniqueFileName(OUT, DATA);
      await fs.writeFile(outFile, JSON.stringify(data, null, 4));
      console.log('JSON data is saved.');
    } catch (err) {
      console.error(err);
    }
}
  
processFiles();