import { JSDOM } from 'jsdom';

const REGEX = /<hr(?!.*\bclass=["']section["']).*\/?>/gim;//<hr\s*(class=\"((?!section).)*\")?\s*\/?>

export interface Information {
    written: string | undefined;
    published: string | undefined;
    source: string | undefined;
    translated: string | undefined;
    transcription: string | undefined;
    copyright: string | undefined;
    other: { name: string, value: string }[] | undefined
}

export interface Article {
    title: string;
    information: Information | undefined;
    html: string | null | undefined;
    content: string | null | undefined;
}


export default class ArticleParser {

    public static information(dom: JSDOM): Information | undefined {
        const info = dom.window.document.querySelector('.information');
        if (info) {
            const uglyInformation = [...info.outerHTML.matchAll(/<span\sclass="info".*?>([\w\W]*?)<\/span>([\w\W]*?)(<br\/?>|<\/p>)/gim)]
                .map((match: any) => {
                    const [, infoContent, content] = match;
                    return { info: infoContent.replace(':', '').trim(), content: content.trim() };
                });


            //Map {info:..., content:...} to Information
            let information: Information = {
                written: undefined,
                published: undefined,
                source: undefined,
                translated: undefined,
                transcription: undefined,
                copyright: undefined,
                other: undefined
            };
            uglyInformation.forEach(x => {
                var info: string = x.info.toLowerCase();

                if (info === 'written' || info === 'recorded') {
                    information.written = x.content;
                } else if (info.includes('published')) {
                    information.published = x.content;
                } else if (info === 'source') {
                    information.source = x.content;
                } else if (info === 'translated') {
                    information.translated = x.content;
                } else if (info.includes('transcription') || info.includes('markup')) {
                    information.transcription = x.content;
                } else if (info === 'copyleft' || info === 'public domain') {
                    information.copyright = x.content;
                } else {
                    if (!information.other)
                        information.other = []
                    information.other.push({ name: x.info, value: x.content });
                }
            });
            return information;
        }
        else return undefined;
    }
    public static content(dom: JSDOM): HTMLElement | undefined { //1810/4187 missing `<!-- t2h-body -->` or number of `<p>`
        return dom.window.document.body;
    }

    public static parse(file: string, html: string): Article {
        const dom = new JSDOM(html);
        const content = this.content(dom);
        return {
            title: file,
            information: this.information(dom),
            html: content?.outerHTML,
            content: content?.textContent,
        };
    }
}
