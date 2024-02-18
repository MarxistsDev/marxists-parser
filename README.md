# Marxists Parser
It's important to know that the current system is *objectively bad*.
This is because this is more like my experimental workstation.

The current workflow goes like this `parser` -> `json` -> `DataLoader` -> `Database`.
The reason I used json files is because I am not trying to [DOS](https://en.wikipedia.org/wiki/Denial-of-service_attack) the marxists.org servers, please do not do that either.  

Also don't be fooled by the `.test.ts` files, these are not tests, but simply a way to run the parser.

This needs to be refactored and currently exists only as a proof of concept.

## Installation Guide
### Code
1. Install needed packages (I'm using Fedora):
```
sudo dnf install nodejs git tsc
```
2. Install repo
```
git clone https://github.com/MarxistsDev/marxists-parser.git
cd marxists-parser
npm install
```
### Database
WARNING: This is hell to figure out.

Source: https://docs.fedoraproject.org/en-US/quick-docs/postgresql/
```
sudo dnf install postgresql-server postgresql-contrib
sudo systemctl enable postgresql
sudo postgresql-setup --initdb --unit postgresql
sudo systemctl start postgresql
sudo -u postgres psql
    ALTER USER postgres PASSWORD 'password';
    CREATE DATABASE marxists;
    \q
sudo su
vi /var/lib/pgsql/data/pg_hba.conf

Change the Methouds to `md5` for example:
    # TYPE  DATABASE        USER            ADDRESS                 METHOD

    # "local" is for Unix domain socket connections only
    local   all             all                                     md5
    # IPv4 local connections:
    host    all             all             127.0.0.1/32            md5
    # IPv6 local connections:
    host    all             all             ::1/128                 md5
    # Allow replication connections from localhost, by a user with the
    # replication privilege.
    local   replication     all                                     peer
    host    replication     all             127.0.0.1/32            md5
    host    replication     all             ::1/128                 md5
```

## How the system Works
If you look thought the network tab of you browsers developer tools you will find 3 json files:
- https://www.marxists.org/admin/js/data/authors.json
- https://www.marxists.org/admin/js/data/sections.json (Currently unused in the system)
- https://www.marxists.org/admin/js/data/periodicals.json (Currently unused in the system)

The first is used to find all the authors in the system (A save version should be in the `data/` folder).
Most authors have `"href"` pointing to their own works page, for example `"Abern, Martin"` points to https://www.marxists.org/history/etol/writers/abern/index.htm.
This is not the case for everyone thought, for famous authors (in reality probably just older pages) the they have there a special page, 
for example:  `"Lenin, Vladimir Ilyich"` points to https://www.marxists.org/archive/lenin/works/index.htm while the actual works page is at https://www.marxists.org/archive/lenin/by-date.htm.

If you look at the scripts in `package.json` you will find:
```
  "scripts": {
    "start": "node ./dist/index.js",
    "dev": "npx tsc && node ./dist/index.js",
    "test-article": "npx tsc && node ./dist/ArticleParser.test.js",
    "analyze-article": "npx tsc && node ./dist/ArticleParser.analyze.js",
    "test-work": "npx tsc && node ./dist/WorkParser.test.js",
    "test-work2": "npx tsc && node ./dist/WorkParser.test2.js",
    "test-glossary": "npx tsc && node ./dist/GlossaryParser.test.js",
    "test-index": "npx tsc && node ./dist/IndexParser.test.js",
    "test-author": "npx tsc && node ./dist/Author.downloader.js",
    "download": "npx tsc && node ./dist/downloader.js",
    "db": "npx tsc && node ./dist/DataLoader.js"
  },
```

### Running the system
If you look at the `DataLoader.ts` you will find all the needed files.
WARNING: This is a pain, but currently this is how the workflow works.

1. Generate `glossary.json` with `npm run test-glossary`
2. Edit `Author.downloader.ts` and `npm run test-author`
3. Edit the `main()` in `downloader.ts` (it's looking for the json file you made in the previous step) and `npm run download`
4. Enter the following in the terminal / psql: 
```
sudo -u postgres psql postgres
DROP DATABASE marxists;
CREATE DATABASE marxists;
```
5. Go to the `marxists.org` (the go project / Front-end) and `npm run go` (yes this *other* repo is using npm)
6. Enter the following in the terminal / psql: 
```
sudo -u postgres psql postgres
ALTER TABLE "Glossary" 
ADD search tsvector
    generated always as (
        setweight(to_tsvector('simple', name), 'A') 
            || ' ' || setweight(to_tsvector('english',description), 'B') :: tsvector
    ) stored;

CREATE INDEX idx_glossary_search on "Glossary" using GIN(search);

ALTER TABLE "Work"
ADD COLUMN search tsvector;
CREATE INDEX idx_work_search on "Work" using GIN(search);
```
7. Edit `DataLoader.ts` and `npm run db`
8. Enter the following in the terminal / psql:
```
sudo -u postgres psql postgres
UPDATE "Glossary" 
	SET author_id = (SELECT author_id FROM "Author" where name ILIKE '%mao%') 
WHERE name ILIKE '%mao%';
```
