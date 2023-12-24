import * as fs from 'fs/promises';
import axios from 'axios';
import * as path from 'path';

const URL = "https://www.marxists.org/";

async function downloadFile(item:{href:string;}, outDir:string) {
    try {
        if (item['href'].endsWith('.html') || item['href'].endsWith('.htm')) {
            const response = await axios.get(URL + item['href'], { responseType: 'text', responseEncoding:'binary' });

            if (!response.data.includes('<title>Object not found!</title>')) {
                console.log(item['href']);
                const filePath = path.join(outDir, item['href'].replace(/\//g, '.'));
                await fs.writeFile(filePath, response.data.toString('latin1'));
            }
        }
    } catch (error) {
        console.error(`Error downloading file ${item['href']}: ${error}`);
    }
}

async function downloadFromJson(filename: string, outDir: string = 'www', dir: string = 'data') {
    try {
        const jsonContents = await fs.readFile(`./${dir}/${filename}.json`, 'utf8');
        const data = JSON.parse(jsonContents);

        const downloadPromises = data.map((item:{href:string;}) => downloadFile(item, outDir));
        await Promise.all(downloadPromises);
    } catch (error) {
        console.error(`Error reading JSON file ${filename}: ${error}`);
    }
}

async function main() {
    await downloadFromJson('lenin');
    await downloadFromJson('authors', 'authors');
    await downloadFromJson('glossary_index', 'glossary');
}

main();
