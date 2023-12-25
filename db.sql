-- Create the Author table
CREATE TABLE Author (
  author_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  old_works TEXT
);

CREATE TABLE Glossary (
  glossary_id INTEGER PRIMARY KEY,
  author_id INTEGER REFERENCES Author(author_id),
  name TEXT NOT NULL,
  --shortname TEXT,
  image TEXT,
  description TEXT,
  FOREIGN KEY (author_id) REFERENCES Author(author_id)
);

-- Create Work table
CREATE TABLE Work (
  work_id INTEGER PRIMARY KEY,
  parent_work_id INTEGER REFERENCES Work(work_id),
  title TEXT NOT NULL,
  written TEXT,
  publication_date TEXT,
  source TEXT,
  translated TEXT,
  transcription TEXT,
  copyright TEXT,
  old_work TEXT,
  content TEXT,
  html TEXT
);

-- Create the Author_Work table for the Many-to-Many relationship between Author and Work
CREATE TABLE Author_Work (
    author_author_id INTEGER NOT NULL,
    work_work_id INTEGER NOT NULL,
    PRIMARY KEY (author_author_id, work_work_id)
);

-- Create the Movement table
CREATE TABLE Movement (
    movement_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    old_movement TEXT
);

-- Create the Collection table
CREATE TABLE Collection (
    collection_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    old_collection TEXT
);

-- Create the Movement_Author table for the Many-to-Many relationship between Movement and Author
CREATE TABLE Movement_Author (
    movement_author_id INTEGER PRIMARY KEY,
    movement_id INTEGER NOT NULL,
    author_id INTEGER NOT NULL,
    FOREIGN KEY (movement_id) REFERENCES Movement (movement_id),
    FOREIGN KEY (author_id) REFERENCES Author (author_id)
);

-- Create the Collection_Work table for the Many-to-Many relationship between Collection and Work
CREATE TABLE Collection_Work (
    collection_work_id INTEGER PRIMARY KEY,
    collection_id INTEGER NOT NULL,
    work_id INTEGER NOT NULL,
    FOREIGN KEY (collection_id) REFERENCES Collection (collection_id),
    FOREIGN KEY (work_id) REFERENCES Work (work_id)
);
-- select * from Author inner join Author_Shortname on Author.author_id == Author_Shortname.author_id where Author_Shortname.shortname == 'lenin';
