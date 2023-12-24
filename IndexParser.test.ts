import indexParser from './IndexParser';
import { Index } from './common';
import axios from 'axios';



const testIndex = async () => {
  const index: Index = {
    title: "The State and Revolution",
    href: "https://www.marxists.org/archive/lenin/works/1917/staterev/index.htm",
    //href: "./www/archive.lenin.works.1917.staterev.index.htm",
    works: undefined
  }
  console.log("Before: ", index);
  const parsed = await indexParser(index);
  console.log("After: ", parsed);
  /*const maxConcurrency = 50;

  // Create a queue with the specified concurrency limit
  const queue = new Queue(maxConcurrency);

  const reqs = Array(100).fill(0).map((_) =>
    queue.push(() => fetchData("https://www.marxists.org/archive/lenin/works/1917/staterev/index.htm")
    ));

  await queue.run();
  console.log(queue.result);*/
}

testIndex();
