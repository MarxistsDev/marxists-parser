import { JSDOM } from "jsdom";
import axios from 'axios';
import { Index, Work } from './common'

const anchorFilters = (dom: JSDOM): HTMLAnchorElement[] => {
const uniqueHrefs = new Set<string>();
  const anchors = Array.from(dom.window.document.querySelectorAll('a'))
    .filter((value: HTMLAnchorElement) =>
      value.getAttribute('href') != null 
        && !value.getAttribute('href')!.startsWith('../')
        && !/\#[\w\d]+$/.test(value.getAttribute('href') ?? ''));
}

const anchorsToWorks = (anchors: HTMLAnchorElement[]): Work[] => {
  return anchors.map<Work>((anchor: HTMLAnchorElement) => {
    return {
      title: anchor.textContent,
      href: anchor.href,
      content: undefined
    } as Work
  });
}

export default async function indexParser(index: Index): Promise<Index> {
  const response = await axios.get(index.href, { responseType: 'text', responseEncoding: 'binary' });
  const dom = new JSDOM(response.data);
  index.works = anchorsToWorks(anchorFilters(dom));
  return index;
}
