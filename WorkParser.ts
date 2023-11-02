import { JSDOM } from 'jsdom';

export interface Data {
    "id": number;
    "index": number;
    "type": number;
    "href": string;
    "name": string;
    "_datatype": string;
}

export async function works(href: string, text: string) {
    const dom = new JSDOM(text);

    const filteredLinks:any = Array.from(dom.window.document.querySelectorAll('.indentb a, .index a, .fst a, .tda a, .toc a, .disc a')).filter(x => x.getAttribute('href'));//.map(x => x.getAttribute('href'));
    //console.log(href, filteredLinks);

    const links = Array.from(dom.window.document.querySelectorAll('a'));

    filteredLinks.push(...links.filter((x: HTMLAnchorElement) => {
        try {
            let y = x.href.includes('works/') || /^\d{2,4}\//.test(x.href!.replace('works/', '').replace('../', ''));
 
            if (!y && x.href.trim() != '' && !x.href.toLowerCase().includes('about')) { // Testing
                if(x.href.endsWith('.pdf'))
                    console.log('pdf: ', href.replace(/\./g, '/').replace('/htm', '.htm').replace(/\/[\w\-]+.htm(l)?$/, '/') 
                            + x.href.replace('works/', '').replace(/\.\.\//g, ''));
                else
                    console.log('raw: ', x.href,', url: ', href.replace(/\./g, '/')
                        .replace('/htm', '.htm')
                        .replace(/\/[\w\-]+.htm(l)?$/, '/') 
                            + x.href.replace('works/', '').replace(/\.\.\//g, ''));
            }
            return y;
        } catch (err) { }
    }));


    if(filteredLinks.length == 0)
        console.log(href);
    const linkobj = filteredLinks.map((x: HTMLAnchorElement) =>
    ({
        href: href.replace(/\./g, '/')
            .replace('/htm', '.htm')
            .replace(/\/[\w\-]+.htm(l)?$/, '/') 
                + x.getAttribute('href')!.replace('works/', '').replace(/\.\.\//g, ''),
        title: x.textContent
    }));

    const unique:{href:string;title:string;}[] | unknown[] = Array.from(new Map(linkobj.map((item:{href:string;title:string;}) =>[item['href'], item])).values());

    return unique;
}