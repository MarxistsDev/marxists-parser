import axios from 'axios';import { getUniqueFileName, heDecode } from './common';
import { works } from './WorkParser';

const testUrl = "https://www.marxists.org/archive/lenin/works/1917/staterev/index.htm";


const parserTest = async() => {
    const html = await axios.get(testUrl, { responseType: 'text', responseEncoding:'binary' }); 
    const res = await works(testUrl, heDecode(html.data.toString('latin1')));
    console.log(res);
}

parserTest();