import axios from 'axios';
import fs from 'fs/promises';
import { getUniqueFileName, heDecode } from './common';
import { works } from './WorkParser';

const testUrl = "https://www.marxists.org/reference/archive/mao/selected-works/date-index.htm";


const parserTest = async() => {
    const html = await axios.get(testUrl, { responseType: 'text', responseEncoding:'binary' }); 
    const res = await works(testUrl, heDecode(html.data.toString('latin1')));
    await fs.writeFile('./data/mao_works2.json', JSON.stringify(res, null, 4));
}

parserTest();
