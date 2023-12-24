import indexParser from './IndexParser';
import { Index } from './common';



const testIndex = async() => {
  const index: Index = {
    title: "The State and Revolution",
    href: "https://www.marxists.org/archive/lenin/works/1917/staterev/index.htm",
    //href: "./www/archive.lenin.works.1917.staterev.index.htm",
    works: undefined
  }
  console.log("Before: ", index);
  const parsed = await indexParser(index);
  console.log("After: ", parsed);
}

testIndex();
