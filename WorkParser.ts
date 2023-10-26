const jsdom = require('jsdom');
const { JSDOM } = jsdom;

export interface Data {
    "id": number;
    "index": number;
    "type": number;
    "href": string;
    "name": string;
    "_datatype": string;
}

export async function works(href:string, text: string) {
    /*console.log(href);
    const response = await fetch(href);
    const text = await response.text();*/

    const dom = new JSDOM(text);

    const links = Array.from(dom.window.document.querySelectorAll('a'));

    const filteredLinks = links.filter((x: any) => {
        try {
            return /^\d{2,4}\//.test(x.getAttribute('href').replace('works/', '').replace('../', ''));
        } catch (err) { }
    });

    return filteredLinks.map((x: any) => ({ href: href.replace('.', '\/').replace('\/htm', '.htm').replace(/\/[\w\-]+.htm(l)?$/, '/') + x.href, title: x.text }));
}