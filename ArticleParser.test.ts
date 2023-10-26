import ArticleParser, { Article } from "./ArticleParser";
import fs from 'fs/promises';
import path from 'path';
import { Worker, isMainThread, parentPort, workerData } from "worker_threads";

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
const FOLDER = './www/';
const OUT = 'full';
const DATA = './data/';

async function processFilesInWorker() {
  const { files } = workerData;
  const articles = [];

  for (const file of files) {
    if (file.endsWith('.htm') || file.endsWith('.html')) {
      const filePath = path.join(FOLDER, file);
      const html = await fs.readFile(filePath, 'utf8');
      articles.push(ArticleParser.parse(file.replace('.html', '').replace('.htm', ''), html));
    }
  }

  return articles;
}

async function getFilesToProcess() {
  const files = await fs.readdir(FOLDER);
  return files;
}

async function main() {
  if (isMainThread) {
    const files = await getFilesToProcess();
    const numThreads = require('os').cpus().length; // Number of CPU cores

    const chunkSize = Math.ceil(files.length / numThreads);
    const workerPromises = [];

    for (let i = 0; i < numThreads; i++) {
      const start = i * chunkSize;
      const end = start + chunkSize;
      const workerFiles = files.slice(start, end);

      const workerPromise = new Promise((resolve, reject) => {
        const worker = new Worker(__filename, {
          workerData: { files: workerFiles },
        });

        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
          if (code !== 0) {
            reject(new Error(`Worker stopped with exit code ${code}`));
          }
        });
      });

      workerPromises.push(workerPromise);
    }

    const results = await Promise.all(workerPromises);
    const articles = results.reduce((acc:any, result) => acc.concat(result), []);

    const outFile = await getUniqueFileName(OUT);
    await fs.writeFile(outFile, JSON.stringify(articles, null, 4));
    console.log('JSON data is saved.');
  } else {
    const articles = await processFilesInWorker();
    parentPort?.postMessage(articles);
  }
}

main();