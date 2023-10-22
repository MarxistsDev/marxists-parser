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
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
function works(href, text) {
    return __awaiter(this, void 0, void 0, function* () {
        /*console.log(href);
        const response = await fetch(href);
        const text = await response.text();*/
        const dom = new JSDOM(text);
        const links = Array.from(dom.window.document.querySelectorAll('a'));
        const filteredLinks = links.filter((x) => {
            try {
                return /^\d{2,4}\//.test(x.getAttribute('href').replace('works/', '').replace('../', ''));
            }
            catch (err) { }
        });
        return filteredLinks.map((x) => ({ href: href.replace(/\/[\w\-]+.htm(l)?$/, '/') + x.href, title: x.text }));
    });
}
exports.works = works;
