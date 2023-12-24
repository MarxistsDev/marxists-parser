import { Works, Work, Index } from './common';
import indexParser from './IndexParser';
import { works } from './WorkParser';
import axios from 'axios';

// Get Full List off Works and Indexs for Lenin

const loadAuthorJson = async(author_works: string) => {
  const works_index = (await axios.get("https://marxists.org/"+author_works, { responseType: 'text', responseEncoding:'binary' })).data; 
  const work:(Work | Index)[] | undefined  = await works(author_works, works_index); 
  console.log("Work:", work);
  if(work === undefined)
    throw new Error("Damn");
  const res = await Promise.all(work.map(async (x: (Work | Index)) => {
    try{
    if(x.href.endsWith('index.htm')) //Typescript is a stupid language
      return await indexParser((x as Index));
    } catch (err){
      console.error("failed page:", x.href);
    }
    return x;
  }));
  console.log(res);
}

loadAuthorJson("archive/lenin/by-date.htm");
