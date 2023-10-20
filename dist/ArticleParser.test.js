"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ArticleParser_1 = __importDefault(require("./ArticleParser"));
const fs_1 = __importDefault(require("fs"));
const displayArr = (arr) => arr.forEach((element, index) => {
    console.log(index, element);
});
/*const testFormat = (article:object) => {
    return article.;
}*/
const testController = (article) => {
    console.log(JSON.stringify(article), ',');
};
console.log('[');
fs_1.default.readdir('./lenin', (err, list) => {
    list.forEach(file => {
        if (file.endsWith('.htm') || file.endsWith('.html'))
            fs_1.default.readFile(`./lenin/${file}`, (err, html) => {
                testController(ArticleParser_1.default.parse(file.replace('.html', '').replace('.htm', ''), html.toString()));
            });
    });
});
/*let list = ['00gyz75', 'x06', 'viii8iii', '17a', '16mvk', 'ch00', 'ch02s7'];
console.log('[')
list.forEach(ele => {
    fs.readFile(`./html/${ele}.htm`, (err, html)=>{
        testController(ArticleParser.parse(`${ele}.htm`, html.toString()));
    });
});*/ 
