import { Works, Work, Index } from './common';
import indexParser from './IndexParser';
import { works } from './WorkParser';
import axios from 'axios';
import fs from 'fs/promises';

// Get Full List off Works and Indexs for Lenin

const loadAuthorJson = async (author_works: string, outFile: string) => {
  const works_index = (await axios.get("https://marxists.org/" + author_works, { responseType: 'text', responseEncoding: 'binary' })).data;
  const work: (Work | Index)[] | undefined = await works(author_works, works_index);
  console.log("Work:", work);
  if (work === undefined)
    throw new Error("Damn");
  /*const res = await Promise.all(work.map(async (x: (Work | Index)) => {
    try{
    if(x.href.endsWith('index.htm')) //Typescript is a stupid language
      return await indexParser((x as Index));
    } catch (err){
      console.error("failed page:", x.href);
    }
    return x;
  }));*/

  const res = [];
  for (const x of work) {
    try {
      if (x.href.endsWith('index.htm')) {
        const result = await indexParser(x as Index);
        res.push(result);
      } else {
        res.push(x);
      }
    } catch (err) {
      console.error("failed page:", x.href);
    }
  }
  await fs.writeFile(outFile, JSON.stringify(res, null, 4))
}

loadAuthorJson("archive/lenin/by-date.htm", "./data/lenin_works.json");
