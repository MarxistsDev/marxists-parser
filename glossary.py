import requests, json
from string import ascii_lowercase

glosorylist:dict = []
for c in ascii_lowercase:
    for i in ascii_lowercase:
        url = f"glossary/people/{c}/{i}.htm"#f"https://www.marxists.org/glossary/people/{c}/{i}.htm"
        glosorylist.append({"href": url})

#print(glosorylist)

with open('./data/glossary.json', 'w') as glossary:
    json.dump(glosorylist, glossary)
