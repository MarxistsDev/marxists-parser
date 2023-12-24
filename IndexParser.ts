import { JSDOM } from "jsdom";
import axios from 'axios';
import { Index, Work } from './common'

const anchorFilters = (dom: JSDOM): HTMLAnchorElement[] => {
  const uniqueHrefs = new Set<string>();
  const anchors = Array.from(dom.window.document.querySelectorAll('a'))
    .filter((value: HTMLAnchorElement) => {
      const href = value.getAttribute('href');
      if (
        href != null &&
        !href.startsWith('../') &&
        !/\#[\w\d]+$/.test(href) &&
        !uniqueHrefs.has(href)
      ) {
        uniqueHrefs.add(href);
        return true;
      }
      else
        return false;
    });
  return anchors;
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
  const response = await axios.get(index.href, { responseType: 'text', responseEncoding: 'binary', timeout: 10000});
  const dom = new JSDOM(response.data);
  index.works = anchorsToWorks(anchorFilters(dom));
  return index;
}
