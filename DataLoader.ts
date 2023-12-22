import * as sqlite3 from 'sqlite3';
import * as fs from 'fs';
import { Glossary, getShortname } from './GlossaryParser';
import { Article } from './ArticleParser';
import { title } from 'process';

// Connect to the SQLite database
const conn = new sqlite3.Database('_db.db');
const cursor = conn.run.bind(conn);

// Load data from the JSON file

const jsonContentGlossary = fs.readFileSync('./data/glossary.json', 'utf-8');
const glossaryData: Glossary[] = JSON.parse(jsonContentGlossary);


const jsonContent = fs.readFileSync('./data/authors.json', 'utf-8');
const authorData = JSON.parse(jsonContent);


const jsonContentWorks = fs.readFileSync('./data/work.json', 'utf-8');
const worksData = JSON.parse(jsonContentWorks);



const glossary = () => {

    // Iterate through the JSON data and insert into the Glossary table
    for (const author of glossaryData) {
        //console.log(author);
        const name = author['term'];
        const description = author['content'];
        const shortnames = author['shortname'] || [];
        const image = author['image'] || null;

        // Insert the data into the Glossary table
        console.log(`INSERT INTO Glossary (name, image, description) VALUES ('${name?.trim()}', '${image?.trim()}', '${description?.trim().replace(/\n/g, '')}')`);
        cursor("INSERT INTO Glossary (name, image, description) VALUES (?, ?, ?)", [name?.trim(), image?.trim(), description?.trim().replace(/\n/g, '')], function (err) {
            if (err) {
                console.error(err.message);
            } else {
                const glossaryId = this.lastID;
            }
        });
    }


};

const authors = () => {
    // Iterate through the JSON data and insert into the Glossary table
    for (const author of authorData) {
        //console.log(author);
        const name = author['name'];
        const href = author['href'];

        cursor("INSERT INTO Author (name, old_works) VALUES (?, ?)", [name, href], function (err) {
            if (err) {
                console.error(err.message);
            } else {
                const authorId = this.lastID;

                const matchingTerm = glossaryData.find(entry => entry.term?.includes(author.name))
                    ?? glossaryData.find((entry) => entry.shortname?.includes(getShortname(author.href)));

                if (matchingTerm)
                    cursor("UPDATE Glossary SET author_id = ? WHERE name = ?", [authorId, matchingTerm.term?.trim()], function (err) {
                        if (err) {
                            console.error(err.message);
                        }
                    });
            }
        });
    }
};

const findWorkTitleAndAuthor = async (file_title: string): Promise<{ author_id: number | undefined; title: string; }> => {
    let title = file_title;
    let author_id: number | undefined = undefined;
    let author_work_link: string | undefined;

    for (const Author_works in worksData) {
        //console.log(`${file_title.replace(/\./g, '/')}.htm`, worksData[Author_works].find((x: { href: string; title: string; }) => x.href === `${file_title.replace(/\./g, '/')}.htm`))
        worksData[Author_works].forEach((element: { href: string; title: string; }) => {
            //console.log(file_title.replace(/\./g, '/'), element.href)
            if (element.href === `${file_title.replace(/\./g, '/')}.htm`) {
                title = element.title;
                author_work_link = Author_works;
            }
        });
    }

    //console.log(title, author_work_link);

    if (author_work_link) {
        //console.log(author_work_link.replace(/\./g, '/').replace('/htm', '.htm'))
        const row = await new Promise<{ author_id: number }>((resolve, reject) => {
            conn.get("SELECT author_id FROM Author WHERE old_works = ?", [author_work_link?.replace(/\./g, '/').replace('/htm', '.htm')], (err, row: { author_id: number }) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row || { author_id: undefined });
                }
            });
        });

        // Check if a row is returned
        if (row) {
            author_id = row.author_id;
        }
    }

    console.log(author_id, title);
    return { author_id, title };
}

const addWork = async(element: Article) => {
    const { author_id, title } = await findWorkTitleAndAuthor(element.title);


    const work_id: number = await new Promise<number>((resolve, reject) => {
        cursor("INSERT INTO Work (old_works_index, written, publication_date, source, translated, transcription, copyright, title) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [element.title, element.information?.written, element.information?.published,
            element.information?.source, element.information?.translated, element.information?.transcription,
            element.information?.copyright, title], function (err) {
                if (err) {
                    console.error("Work", err.message);
                    reject(err);
                }
                else {
                    resolve(this.lastID);
                }
            });
    });

    await new Promise((resolve, reject) => {
        cursor("Insert INTO Author_Work (author_id, work_id) VALUES (?, ?)", [author_id, work_id], (error) => {
            if (error) {
                reject(error);
            } else {
                resolve(undefined);
            }
        });
    });

    return work_id;
}

const articles = async () => {
    const jsonContent = fs.readFileSync('./data/article.json', 'utf-8');
    const article: Article[] = JSON.parse(jsonContent);

    let indexList: { [key: string]: number } = {};

    // Indexes first
    await Promise.all(article.map(async (element) => {
        if (element.title.endsWith('index')) {
            indexList[element.title.replace('.index', '')] = await addWork(element);
        }
    }));

    //console.log(indexList);

    await Promise.all(article.map(async (element) => {
        if (!element.title.endsWith('index')) {
            const path = element.title.slice(0, element.title.lastIndexOf('.'));

            let hadNoWorkParent:number = -90;
            if (!indexList[path])
                hadNoWorkParent = await addWork(element)

            cursor("INSERT INTO Article (work_id, title, content, note) VALUES (?, ?, ?, ?)", [indexList[path]?indexList[path]:hadNoWorkParent, element.title, element.content, JSON.stringify(element.notes)], function (err) {
                if (err) {
                    console.error("Article", err.message);
                } else {
                    const glossaryId = this.lastID;
                }
            });
        }
    }));
};

const main = async () => {
    try {

        glossary();

        //authors();

        //await articles();
    } finally {
        // Always close the database connection in a finally block
        conn.close((err) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    }
};

main();
