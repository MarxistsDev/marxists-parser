import { JSDOM } from 'jsdom';

type Link = {
    title: string,
    href: string,
    from: string // Remove in the future, since it's super inefficient and is for testing reasons
};

type Work = Link & {
    content: string | undefined,
};

type Index = Link & {
    works: Work[] | undefined, 
};

export type Works = {
  [key: string]: (Work | Index)[] | undefined;
}

export async function works(href: string, text: string):Promise<(Work | Index)[] | undefined> {
    const normalizedHref = href.replace(/\./g, '/').replace('/htm', '.htm')
    const dom = new JSDOM(text);
    dom.reconfigure({
        url: 'https://www.marxists.org/' + normalizedHref,
    });
    
    const filteredLinks:any = Array.from(dom.window.document
        .querySelectorAll('.indentb a, .index a, .fst a, .tda a, .toc a, .disc a')
    ).filter(x => x.getAttribute('href'));//.map(x => x.getAttribute('href'));
    //console.log(normalizedHref, filteredLinks.map((x:any) => x.href));
    const links = Array.from(dom.window.document.querySelectorAll('a'));

    filteredLinks.push(...links.filter((x: HTMLAnchorElement) => {
        try {
            return x.href.includes('works/') || /^\d{2,4}\//
                .test(x.href!.replace('works/', '').replace('../', ''));
        } catch (err) { }
    }));


    if(filteredLinks.length == 0)
        return undefined;
    const linkobj = filteredLinks.map((x: HTMLAnchorElement) =>{
        if(x.href.endsWith('index.htm'))
            return {
                title: x.textContent,
                href: x.href,
                from: 'https://www.marxists.org/' + normalizedHref,
                works: undefined
            } as Index;
 
        return {
            href: x.href,
            title: x.textContent,
            from: 'https://www.marxists.org/' + normalizedHref,
            content: undefined
        } as Work;
    });

    const unique:(Work | Index)[] = Array.from(new Map(linkobj
        .map((item:(Work | Index)) =>
            [item['href'], item])).values()) as (Work | Index)[];
    return unique; 
}
