"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.works = void 0;
const jsdom_1 = require("jsdom");
function works(href, text) {
    return __awaiter(this, void 0, void 0, function* () {
        /*console.log(href);
        const response = await fetch(href);
        const text = await response.text();*/
        const dom = new jsdom_1.JSDOM(text);
        const filteredLinks = Array.from(dom.window.document.querySelectorAll('.indentb a, .index a, .fst a, .tda a, .toc a, .disc a')).filter(x => x.getAttribute('href')); //.map(x => x.getAttribute('href'));
        //console.log(href, filteredLinks);
        const links = Array.from(dom.window.document.querySelectorAll('a'));
        filteredLinks.push(...links.filter((x) => {
            try {
                let y = x.href.includes('works/') || /^\d{2,4}\//.test(x.href.replace('works/', '').replace('../', ''));
                if (!y && x.href.trim() != '' && !x.href.toLowerCase().includes('about')) { // Testing
                    if (x.href.endsWith('.pdf'))
                        console.log('pdf: ', href.replace(/\./g, '/').replace('/htm', '.htm').replace(/\/[\w\-]+.htm(l)?$/, '/')
                            + x.href.replace('works/', '').replace(/\.\.\//g, ''));
                    else
                        console.log('raw: ', x.href, ', url: ', href.replace(/\./g, '/')
                            .replace('/htm', '.htm')
                            .replace(/\/[\w\-]+.htm(l)?$/, '/')
                            + x.href.replace('works/', '').replace(/\.\.\//g, ''));
                }
                return y;
            }
            catch (err) { }
        }));
        /*const unique:HTMLAnchorElement[] = Array.from(new Set(filteredLinks.map));
    
        if(unique.length == 0)
            console.log(href);
        return unique.map((x: HTMLAnchorElement | Element) =>
        ({
            href: href.replace(/\./g, '/')
                .replace('/htm', '.htm')
                .replace(/\/[\w\-]+.htm(l)?$/, '/')
                    + x.getAttribute('href')!.replace('works/', '').replace(/\.\.\//g, ''),
            title: x.textContent
        }));*/
        if (filteredLinks.length == 0)
            console.log(href);
        const linkobj = filteredLinks.map((x) => ({
            href: href.replace(/\./g, '/')
                .replace('/htm', '.htm')
                .replace(/\/[\w\-]+.htm(l)?$/, '/')
                + x.getAttribute('href').replace('works/', '').replace(/\.\.\//g, ''),
            title: x.textContent
        }));
        const unique = Array.from(new Map(linkobj.map((item) => [item['href'], item])).values());
        return unique;
    });
}
exports.works = works;
