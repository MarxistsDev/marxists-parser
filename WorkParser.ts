import { JSDOM } from 'jsdom';
import { Work, Index } from './common'; 

function removeDuplicateLinks(links: (Work | Index)[]): (Work | Index)[] {
    const uniqueLinks: { [key: string]: (Work | Index) } = {};

    links.forEach(link => {
      const baseLink = link.href.split('#')[0];
      if (!uniqueLinks[baseLink] || !link.href.includes('#')) {
        uniqueLinks[baseLink] = link;
      }
    });

    return Object.values(uniqueLinks);
}

export async function works(href: string, text: string):Promise<(Work | Index)[] | undefined> {
    const normalizedHref = href.replace(/\./g, '/').replace('/htm', '.htm')
    const dom = new JSDOM(text);
    dom.reconfigure({
        url: 'https://www.marxists.org/' + normalizedHref,
    });
    
    const filteredLinks:any = Array.from(dom.window.document
        .querySelectorAll('.indentb a, .index a, .fst a, .tda a, .toc a, .disc a')
    ).filter(x => x.getAttribute('href'));
    const links = Array.from(dom.window.document.querySelectorAll('a'));

    filteredLinks.push(...links.filter((x: HTMLAnchorElement) => {
        try {
            return (x.href.includes('works/') || /^\d{2,4}\//
                .test(x.href!.replace('works/', '').replace('../', '')))
                && !/^\#/.test(x.getAttribute('href') ?? ""); // This Filters hrefs that start with `#`, thus not adding the section headers of the works page
        } catch (err) { }
    }));


    if(filteredLinks.length == 0)
        return undefined;
    const linkobj:(Work | Index)[] = filteredLinks.map((x: HTMLAnchorElement) =>{
        return {
            href: x.href,//.replace(/\#.*$/, ''),
            title: x.textContent,
        };
    });
    
    // I'm not sure but I think this does the same as `removeDuplicateLinks`
    /*const unique:(Work | Index)[] = Array.from(new Map(linkobj
        .map((item:(Work | Index)) =>
            [item['href'], item])).values()) as (Work | Index)[];*/
    
    const unique: (Work | Index)[] = removeDuplicateLinks(linkobj); 

    return unique; 
}
