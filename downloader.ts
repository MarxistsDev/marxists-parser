import * as fs from 'fs/promises';
import axios from 'axios';
import * as iconv from 'iconv-lite';
import * as chardet from 'chardet';
import pLimit from 'p-limit';
import * as path from 'path';
import { Index, Work } from './common';

const URL = "https://www.marxists.org/";
const limit = pLimit(5);
let files:string[] = [];


// Must check if is already installed
async function downloadFile(item:{href:string;}, outDir:string) {
    try {
        if ((item['href'].endsWith('.html') || item['href'].endsWith('.htm')) && !files.includes((/*URL +*/ item['href']).replace(/\//g, '.'))) {
            const response = await axios.get(/*URL + */item['href']);
            // Detect the character encoding of the HTML content
            const detectedEncoding = chardet.detect(Buffer.from(response.data)) || 'utf-8';

            const htmlDecode = iconv.decode(Buffer.from(response.data), detectedEncoding);

            if (!htmlDecode.includes('<title>Object not found!</title>')) {
                console.log(">", item['href']);
                const filePath = path.join(outDir,(/*URL + */item['href']).replace(/\//g, '.'));
                await fs.writeFile(filePath, htmlDecode);
            }
        }
    } catch (error) {
        console.error(`~${item['href']} ${error}`);
    }
}

async function downloadFromJson(filename: string, outDir: string = 'www', dir: string = 'data') {
    try {
        const jsonContents = await fs.readFile(`./${dir}/${filename}.json`, 'utf8');
        const data:(Work | Index)[] = JSON.parse(jsonContents);

        /*const downloadPromises = data.flatMap((item:(Work | Index)) => 
            (item as Index).works? 
                (item as Index).works?.map((work: Work) => limit(() => downloadFile(work, outDir))) 
                : limit(() => downloadFile(item, outDir)));
        await Promise.all(downloadPromises);*/
        for(const item of data){ 
            if((item as Index).works)
                for(const work of (item as Index).works ?? [])
                    await downloadFile(work, outDir); 
            else            
                await downloadFile(item, outDir);
        }
    } catch (error) {
        console.error(`Error reading JSON file ${filename} : ${error}`);
    }
}

async function main() {
    files = await fs.readdir('./www3/');
    await downloadFromJson('lenin_works', 'www3');
    await downloadFromJson('stalin_works', 'www3');
    await downloadFromJson('mao_works', 'www3');
    //await downloadFromJson('authors', 'authors');
    //await downloadFromJson('glossary_index', 'glossary');
}

main();
