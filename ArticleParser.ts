import { JSDOM } from 'jsdom';

const REGEX = /<hr(?!.*\bclass=["']section["']).*\/?>/gim;//<hr\s*(class=\"((?!section).)*\")?\s*\/?>

export interface Information{
    written: string | undefined;
    published: string | undefined;
    source: string | undefined;
    translated: string | undefined;
    transcription: string | undefined;
    copyright: string | undefined;
    other: {name:string, value:string}[] | undefined
}

export interface Article{
    title: string;
    information: Information | undefined;
    content: string | undefined;
    notes: Note[];
}

export interface Note{
    id:string;
    text:string;
}

export default class ArticleParser{

    public static information(dom:JSDOM):Information | undefined{
        const info = dom.window.document.querySelector('.information');
        if(info){
            const uglyInformation = [...info.outerHTML.matchAll(/<span\sclass="info".*?>([\w\W]*?)<\/span>([\w\W]*?)(<br\/?>|<\/p>)/gim)]
            .map((match:any) => {
                const [, infoContent, content] = match;
                return { info: infoContent.replace(':', '').trim(), content:content.trim() };
              });


            //Map {info:..., content:...} to Information
            let information:Information = {
                written: undefined,
                published: undefined,
                source: undefined,
                translated: undefined,
                transcription: undefined,
                copyright: undefined,
                other:undefined
            };
            uglyInformation.forEach(x => {
                var info:string = x.info.toLowerCase();

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
                    if(!information.other)
                        information.other = []
                    information.other.push({name:x.info, value:x.content});
                }
            });
            return information;
        }
        else return undefined;
    }
    private static largest(arr:string[]):string{ return arr.reduce((r, c) => r.length >= c.length ? r : c);}
    public static content(dom: JSDOM):string | undefined{ //1810/4187 missing `<!-- t2h-body -->` or number of `<p>`
        //const lst = html.split(REGEX);
        //const lst = new JSDOM(html).window.document.body.outerHTML.split(REGEX);
        const lst = dom.window.document.body.outerHTML.split(REGEX); // 62 to 23
        const lg:string = this.largest(lst);
        const notContentRegex = /(<\s*(footer|head)\s)|(class|id)\s*=\s*\"(footer|head)|(<h\d>\s*Notes\s*<\/h\d>)/;///(((<\s*(footer|head))|(class|id)\s*=\s*\"(footer|head))|(<h\d>Notes<\/h\d>))/;
        // largest work around 60% of the time, so I should for 'sus' tags within it, so that if I find a `<footer>` or `<head>` I can flag in in a log file or print it
        if (!notContentRegex.test(lg)){
           //no footer and head or Notes
           return lg;
        }else{ // if has `<!-- t2h-body -->`
            const body = lst.filter((x:string) => /<!--\s*t\dh-body\s*-->/.test(x))
            if(body && body.length == 1)
                return body[0]; //1810 to 62
            else if (body.length > 1)
                console.log(dom.window.document.body.outerHTML); // never happend in lenin test
            return undefined;
        }
    }

    private static removeDuplicatesAndKeepLongestText(arr: Note[]): Note[] {
        const map = new Map<string, Note>();
    
        for (const obj of arr) {
            if (map.has(obj.id)) {
                const existingObj = map.get(obj.id)!;
                if (obj.text.length > existingObj.text.length) {
                    // Update with the longer text
                    map.set(obj.id, obj);
                }
            } else {
                // Add if not already in the map
                map.set(obj.id, obj);
            }
        }
    
        // Convert map values back to an array
        const uniqueObjects = Array.from(map.values());
    
        return uniqueObjects;
    }

    public static notes(html:string){ // Might be better to just get text
        let note_elements: any[] = [];
        new JSDOM(html.split(REGEX).filter(x => /<h\d>Notes<\/h\d>/.test(x))[0]).window.document.querySelectorAll('p.endnote, .fst') //JSDOM to change
        .forEach((x:any) => note_elements.push(x));
        let notes = note_elements.map(x => {
            let potential_id = /(name|id)\s*=['"](.*?)['"]/.exec(x.outerHTML);
            return {id: potential_id?potential_id[2]:'', text:x.textContent}
        });
        return this.removeDuplicatesAndKeepLongestText(notes);
    }

    public static parse(file:string, html:string):Article{
        const dom = new JSDOM(html);
        return {
            title: file,
            information: this.information(dom),
            content: this.content(dom),
            notes: this.notes(html)
        };
    }
}
