"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
function article(text, file) {
    /*const regex = /<hr(?!.*\bclass=["']section["']).*\/?>/gim;//<hr\s*(class=\"((?!section).)*\")?\s*\/?>
    const article_data = text.replace(/<!--([\w\W]*?)-->/gim, '').split(regex)
    .filter(x => x && x != '/');*/
    /*.filter((element:string, index:number) => index % 2 == 0)*/
    //.slice(1, -1);//slice(1, -1); will 100% be a problem for the future
    //return article_data
    const dom = new JSDOM(text);
    const info = dom.window.document.querySelector('.information');
    return info ? info.outerHTML : `<<<<<<<<<<<<<<<<<<<<<<<<<<${file}>>>>>>>>>>>>>>>>>>>>>>>`;
}
fs_1.default.readdir('./html', (err, list) => {
    list.forEach(file => {
        fs_1.default.readFile(`./html/${file}`, (err, html) => {
            console.log(article(html.toString(), file));
        });
    });
});
