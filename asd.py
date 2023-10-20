import json
with open('./lenin.json') as lenin:
    for i in json.load(lenin):
        print("https://www.marxists.org/"+i['href'])