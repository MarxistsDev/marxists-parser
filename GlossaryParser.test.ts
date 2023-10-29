import { getUniqueFileName } from './common';
import { Glossary, glossary } from './GlossaryParser';
import fs from 'fs/promises';
import path from 'path';

const FOLDER = './glossary/';
const DATA = './data/';
const OUT = 'glossary';

const processFiles = async() => {
    let data:Glossary[] = []; 
    try {
      const files = await fs.readdir(FOLDER);
  
      for (const file of files) {
        if (file.endsWith('.htm') || file.endsWith('.html')) {
          const html = await fs.readFile(FOLDER + file, 'utf-8');
          data.push(...glossary(html));
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