-- Create the Author table
CREATE TABLE Author (
    author_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    image TEXT,
    description TEXT,
    old_works TEXT
);

-- Create the Author_Shortname table for the One-to-Many relationship between Author and Author_Shortname
CREATE TABLE Author_Shortname (
    author_shortname_id INTEGER PRIMARY KEY,
    author_id INTEGER NOT NULL,
    shortname TEXT NOT NULL,
    used_as_folder BOOLEAN NOT NULL,
    FOREIGN KEY (author_id) REFERENCES Author (author_id)
);

-- Create the Work table
CREATE TABLE Work (
    work_id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    written TEXT,
    publication_date TEXT,
    source TEXT,
    translated TEXT,
    transcription TEXT,
    copyright TEXT,
    old_works_index TEXT
);

-- Create the Author_Work table for the Many-to-Many relationship between Author and Work
CREATE TABLE Author_Work (
    author_work_id INTEGER PRIMARY KEY,
    author_id INTEGER NOT NULL,
    work_id INTEGER NOT NULL,
    FOREIGN KEY (author_id) REFERENCES Author (author_id),
    FOREIGN KEY (work_id) REFERENCES Work (work_id)
);

-- Create the Article table
CREATE TABLE Article (
    article_id INTEGER PRIMARY KEY,
    work_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    note TEXT,
    old_works TEXT,
    FOREIGN KEY (work_id) REFERENCES Work (work_id)
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