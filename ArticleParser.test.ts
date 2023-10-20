import ArticleParser from "./ArticleParser";
import fs from 'fs';


const displayArr = (arr:string[]) => arr.forEach((element,index) => {
    console.log(index, element);
 });

/*const testFormat = (article:object) => {
    return article.;
}*/

const testController = (article: any) => {
    console.log(JSON.stringify(article), ',')
}

/*fs.readdir('./html', (err, list)=>{
    list.forEach(file =>{
        if(file.endsWith('.htm') || file.endsWith('.html'))
            fs.readFile(`./html/${file}`, (err, html)=>{
                testController(ArticleParser.parse(file, html.toString()));
            });
    })   
});*/
let list = ['00gyz75', 'x06', 'viii8iii'];
console.log('[')
list.forEach(ele => {
    fs.readFile(`./html/${ele}.htm`, (err, html)=>{
        testController(ArticleParser.parse(`${ele}.htm`, html.toString()));
    });
});