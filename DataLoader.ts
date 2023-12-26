import { Pool } from 'pg';
import * as fs from 'fs';
import { Glossary, getShortname } from './GlossaryParser';
import { Article } from './ArticleParser';
import { Index, Work } from './common';
import { release } from 'os';

// Create a pool for the PostgreSQL database connection
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'marxists',
    password: 'password',
    port: 5432,
    ssl: false,
});

// Load data from the JSON file

const jsonContentGlossary = fs.readFileSync('./data/glossary.json', 'utf-8');
const glossaryData: Glossary[] = JSON.parse(jsonContentGlossary);


const jsonContent = fs.readFileSync('./data/authors.json', 'utf-8');
const authorData = JSON.parse(jsonContent);


const jsonContentWorks = fs.readFileSync('./data/work.json', 'utf-8');
const worksData = JSON.parse(jsonContentWorks);



const glossary = async () => {
    const client = await pool.connect();
    try {
        // Iterate through the JSON data and insert into the Glossary table
        for (const author of glossaryData) {
            //console.log(author);
            const name = author['term'];
            const description = author['content'];
            const shortnames = author['shortname'] || [];
            const image = author['image'] || null;

            // Insert the data into the Glossary table
            await client.query(
                'INSERT INTO "Glossary" (name, image, description) VALUES ($1, $2, $3)',
                [name?.trim(), image?.trim(), description?.trim().replace(/\n/g, '')]
            );
        }
    }catch (e:unknown){
        console.error("Glossary Error:", e);
    } finally {
        client.release();
    }
};

const authors = async () => {
    const client = await pool.connect();
    try {
        // Iterate through the JSON data and insert into the Glossary table
        for (const author of authorData) {
            //console.log(author);
            const name = author['name'];
            const href = author['href'];

            const result = await client.query(
                'INSERT INTO "Author" (name, old_works) VALUES ($1, $2) RETURNING author_id',
                [name, href]
            );
            const authorId = result.rows[0].author_id;

            const matchingTerm =
                glossaryData.find((entry) => entry.term?.includes(author.name)) ||
                glossaryData.find((entry) =>
                    entry.shortname?.includes(getShortname(author.href))
                );

            if (matchingTerm) {
                await client.query(
                    'UPDATE "Glossary" SET author_id = $1 WHERE name = $2',
                    [authorId, matchingTerm.term?.trim()]
                );
            }
        }
    }catch (e:unknown){
        console.error("Author Error:", e);
    } finally {
        client.release();
    }

};

const addWork = async (element: Work, parent: number | null = null): Promise<number> => {

    const client = await pool.connect();
    try {
        if (parent !== null)
            console.log(`INSERT INTO "Work" (old_work, title, parent_work_id) VALUES (${element.href}, ${element.title}, ${parent})`);
        const result = await client.query(
            'INSERT INTO "Work" (old_work, title, parent_work_id) VALUES ($1, $2, $3) RETURNING work_id',
            [element.href, element.title, parent]
        );

        return result.rows[0].work_id;
    } finally {
        client.release();
    }
};

const addAuthorWork = async (element: (Work | Index), author_id: number): Promise<number> => {

    let work_id: number;

    if ((element as Index).works) {
        work_id = await addWork({ title: element.title, href: element.href } as Work);
        let promises: Promise<number>[] = [];
        console.log("Works:", (element as Index).works?.length);
        (element as Index).works?.forEach(async (work) => {
            promises.push(addWork(work as Work, work_id));
        });
        await Promise.all(promises);
    }
    else
        work_id = await addWork(element as Work);


    const client = await pool.connect();
    try {
        await client.query(
            'INSERT INTO "author_works" (author_author_id, work_work_id) VALUES ($1, $2)',
            [author_id, work_id]
        );

        return work_id;
    }catch (e:unknown){
        console.error("Author Work Error:", e);
        return -1;
    } finally {
        client.release();
    }
}


const findAuthorByName = async (name: string): Promise<number | null> => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'SELECT author_id FROM "Author" WHERE name ILIKE $1',
            [`%${name}%`]
        );

        const row = result.rows[0];
        return row ? row.author_id : null;
    }catch (e:unknown){
        console.error("Find Author By Name Error:", e);
        return null;
    } finally {
        client.release();
    }
}


const loadAuthorWork = async (name: string) => { // Note this does not include the content
    const jsonContent = fs.readFileSync(`./data/${name}_works.json`, 'utf-8');
    console.log("JSON loaded");
    const works: (Work | Index)[] = JSON.parse(jsonContent);
    const author_id = await findAuthorByName(name);
    if (author_id == null)
        throw new Error(`Author '${name}' is missing`);
    let promises: Promise<number>[] = [];
    works.forEach(element => {
        promises.push(addAuthorWork(element, author_id));
    });
    Promise.all(promises);
}

const main = async () => {

    await glossary();

    await authors();

    //await articles();
    loadAuthorWork('lenin');
    loadAuthorWork('mao');
    loadAuthorWork('stalin');
};

main();
