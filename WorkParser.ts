import { JSDOM } from 'jsdom';

export interface Data {
    "id": number;
    "index": number;
    "type": number;
    "href": string;
    "name": string;
    "_datatype": string;
}

const removeParentDir = (ogHref:string, fileLink:string):{og:string;link:string;} => {
    const amount_of_parent_dirs = fileLink.match(/\.\.\//g)?.length;

    if (amount_of_parent_dirs)
        console.log('\nfileLink', fileLink, '\namount_of_parent_dirs', amount_of_parent_dirs,
            `\nBefore:`, 
            ogHref.replace(/\./g, '/')
            .replace('/htm', '.htm')
            .replace(/\/[\w\-]+.htm(l)?$/, '/'), 
            `\nAfter:`, 
            ogHref.replace(/\./g, '/')
            .replace('/htm', '.htm')
            .replace(/\/[\w\-]+.htm(l)?$/, '/')
            .split('/')
            .slice(0, !amount_of_parent_dirs||-1*amount_of_parent_dirs===0 ? undefined : -1*(amount_of_parent_dirs + 1))
            .join('/'));
            
    return {
        og:ogHref.replace(/\./g, '/')
            .replace('/htm', '.htm')
            .replace(/\/[\w\-]+.htm(l)?$/, '/')
            .split('/')
            .slice(0, !amount_of_parent_dirs||-1*amount_of_parent_dirs===0 ? undefined : -1*amount_of_parent_dirs + 1/* Since the last index is just empty*/)
            .join('/'),
        link: fileLink.replace('works/', '').replace(/\.\.\//g, '')
    }
};

export async function works(href: string, text: string) {
    const dom = new JSDOM(text);

    const filteredLinks:any = Array.from(dom.window.document.querySelectorAll('.indentb a, .index a, .fst a, .tda a, .toc a, .disc a')).filter(x => x.getAttribute('href'));//.map(x => x.getAttribute('href'));
    //console.log(href, filteredLinks);

    const links = Array.from(dom.window.document.querySelectorAll('a'));

    filteredLinks.push(...links.filter((x: HTMLAnchorElement) => {
        try {
            let y = x.href.includes('works/') || /^\d{2,4}\//.test(x.href!.replace('works/', '').replace('../', ''));
 
            if (!y && x.href.trim() != '' && !x.href.toLowerCase().includes('about')) { // Testing
                const {og, link} = removeParentDir(href, x.href)
                if(x.href.endsWith('.pdf'))
                    console.log('pdf: ', og + link);
                else
                    console.log('raw: ', og + link);
            }
            return y;
        } catch (err) { }
    }));


    if(filteredLinks.length == 0)
        console.log(href);
    const linkobj = filteredLinks.map((x: HTMLAnchorElement) =>{
        const {og, link} = removeParentDir(href, x.href)
        return {
            href: og + link,
            title: x.textContent
        }
    });

    const unique:{href:string;title:string;}[] | unknown[] = Array.from(new Map(linkobj.map((item:{href:string;title:string;}) =>[item['href'], item])).values());

    return unique;
}