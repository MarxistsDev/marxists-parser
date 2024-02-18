import { works } from './WorkParser';
import { getUniqueFileName, decode, Works } from './common';
import fs from 'fs/promises';
import path from 'path';
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

const FOLDER = './authors/';
const DATA = './data/';
const OUT = 'work';

async function processFilesInWorker() {
  const { files } = workerData;
  const data:Works = {};

  for (const file of files) {
    if (file.endsWith('.htm') || file.endsWith('.html')) {
      const filePath = path.join(FOLDER, file);
      const html = await fs.readFile(filePath, 'utf8');
      data[file] = await works(file.replace('.', '/').replace('/htm', '.htm'), decode(html));
    }
  }

  return data;
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
    const workerPromises:Promise<Works> | any = [];

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
        worker.on('exit', (code:number) => {
          if (code !== 0) {
            reject(new Error(`Worker stopped with exit code ${code}`));
          }
        });
      });

      workerPromises.push(workerPromise);
    }

    const results:Works[] = await Promise.all(workerPromises);
    const data = results.reduce((acc, result) => Object.assign(acc, result), {});

    const outFile = await getUniqueFileName(OUT, DATA);
    await fs.writeFile(outFile, JSON.stringify(data, null, 4));
    console.log('JSON data is saved.');
  } else {
    const data:Works = await processFilesInWorker();
    parentPort.postMessage(data);
  }
}

main();
