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

console.log('[')
fs.readdir('./lenin', (err, list)=>{
    list.forEach(file =>{
        if(file.endsWith('.htm') || file.endsWith('.html'))
            fs.readFile(`./lenin/${file}`, (err, html)=>{
                testController(ArticleParser.parse(file.replace('.html', '').replace('.htm', ''), html.toString()));
            });
    })   
});
/*let list = ['00gyz75', 'x06', 'viii8iii', '17a', '16mvk', 'ch00', 'ch02s7'];
console.log('[')
list.forEach(ele => {
    fs.readFile(`./html/${ele}.htm`, (err, html)=>{
        testController(ArticleParser.parse(`${ele}.htm`, html.toString()));
    });
});*/