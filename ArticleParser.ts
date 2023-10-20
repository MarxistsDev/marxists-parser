import { AnyARecord } from "dns";

const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const REGEX = /<hr(?!.*\bclass=["']section["']).*\/?>/gim;//<hr\s*(class=\"((?!section).)*\")?\s*\/?>

export interface Information{
    written: string | undefined;
    published: string | undefined;
    source: string | undefined;
    translated: string | undefined;
    transcription: string | undefined;
    copyright: string | undefined;
    other: {name:string, value:string} | undefined
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

    public static information(dom:any):Information | undefined{
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
                    information.other = {name:x.info, value:x.content};
                }
            });
            return information;
        }
        else return undefined;
    }
    private static largest(arr:string[]){ return arr.reduce((r, c) => r.length >= c.length ? r : c);}
    public static content(html:string):string | undefined{
        const lg = this.largest(html.split(REGEX));
        // largest work 90% of the time, so I should for 'sus' tags within it, so that if I find a `<footer>` or `<head>` I can flag in in a log file or print it
        
        if (!/((<\s*(footer|head))|(class|id)\s*=\s*\"(footer|head))/.test(lg)){ //Need to detect `Notes` too
           //no footer and head
           return lg;
        }else{
            //has footer or head
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

    public static notes(html:string){
        let note_elements: any[] = [];
        new JSDOM(html.split(REGEX).filter(x => /<h\d>Notes<\/h\d>/.test(x))).window.document.querySelectorAll('p.endnote, .fst')
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
            content: this.content(html),
            notes: this.notes(html)
        };
    }
}
