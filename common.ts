import path from "path";
import fs from 'fs/promises';
import * as iconv from 'iconv-lite';
import * as chardet from 'chardet';

export interface Data {
  "id": number;
  "index": number;
  "type": number;
  "href": string;
  "name": string;
  "_datatype": string;
}

type Link = {
  title: string,
  href: string,
};

export type Work = Link & {
  content: string | undefined,
};

export type Index = Link & {
  works: Work[] | undefined,
};

export type Works = {
  [key: string]: (Work | Index)[] | undefined;
}

export async function getUniqueFileName(filename: string, dir: string = './data', ext: string = '.json') {
  let fileNumber = 1; // Start with 2 to get the desired format like full2.json

  while (true) {
    let newFileName = `${filename}${fileNumber}${ext}`;
    if (fileNumber == 1)
      newFileName = `${filename}${ext}`;
    const newPath = path.join(dir, newFileName);

    try {
      await fs.access(newPath);
      // If this line is reached, the file exists; increment the number and try again.
      fileNumber++;
    } catch (err: any) {
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

export async function getFileWithHighestIncrement(baseName: string, extension: string, directory: string = './'): Promise<string | null> {
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

export function decode(text: string){
  const detectedEncoding = chardet.detect(Buffer.from(text)) || 'utf-8';
  const htmlDecode = iconv.decode(Buffer.from(text), detectedEncoding);
  return htmlDecode;
}
