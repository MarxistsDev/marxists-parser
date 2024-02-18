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
        !uniqueHrefs.has(href.replace(/\#[\w\d]+$/, ''))
      ) {
        uniqueHrefs.add(href.replace(/\#[\w\d]+$/, ''));
        //value.setAttribute('href', value.href);
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

  const response = await axios.get(index.href, {
    baseURL: 'https://www.marxists.org',
    headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0' },
    method: 'GET',
    timeout: 10000,
  });
  const dom = new JSDOM(response.data);
  dom.reconfigure({
    url: index.href,
  });
  index.works = anchorsToWorks(anchorFilters(dom));
  return index;
}


export async function removeWorksAlreadyInIndex(list: (Work | Index)[]): Promise<(Work | Index)[]> {
  
  const indexes: Index[] = list.filter((work: (Work | Index)) => (work as Index).works) as Index[];
  
  const indexWorks: Work[] = indexes.flatMap((index: Index) => index.works).filter((x: (Work | undefined)) => x !== undefined) as Work[]; 

  //return works.filter((work: Work) => !indexWorks.some((w: Work) => w.href === work.href));

  return list.filter((work: (Work | Index)) => {
    if (!(work as Index).works)
      return !indexWorks.some((w: Work) => w.href === work.href);
    return true;
  });
}
