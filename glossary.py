import requests
import json
from string import ascii_lowercase

glosorylist: dict = []
for c in ascii_lowercase:
    for i in ascii_lowercase:
        # f"https://www.marxists.org/glossary/people/{c}/{i}.htm"
        url = f"glossary/people/{c}/{i}.htm"
        glosorylist.append({"href": url})

with open('./data/glossary_index.json', 'w') as glossary:
    json.dump(glosorylist, glossary)
