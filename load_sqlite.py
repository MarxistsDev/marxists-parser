import sqlite3
import json

# Connect to the SQLite database
conn = sqlite3.connect('db.db')
cursor = conn.cursor()

# Load data from the JSON file
with open('./data/glossary.json', 'r') as json_file:
    author_data = json.load(json_file)

# Iterate through the JSON data and insert into the Author table
for author in author_data:
    print(author)
    name = author['term']
    description = author['content']
    shortnames = author.get('shortname', [])
    image = author.get('image', None)  

    # Insert the data into the Author table
    cursor.execute("INSERT INTO Author (name, image, description) VALUES (?, ?, ?)", (name, image, description))
    author_id = cursor.lastrowid

    for shortname in shortnames:
        cursor.execute("INSERT INTO Author_Shortname (author_id, shortname, used_as_folder) VALUES (?, ?, ?)", (author_id, shortname, False))


# Commit the changes and close the database connection
conn.commit()
conn.close()
