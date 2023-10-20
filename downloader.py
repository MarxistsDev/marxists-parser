import json
import requests
import os

URL = "https://www.marxists.org/"
FOLDER = './lenins/'

with open('./lenin.json') as lenin:
    for i in json.load(lenin):
        r = requests.get(URL+i['href'])
        print(i['href'])
        with open(os.path.join(FOLDER, i['href'].replace('/', '.')), 'wb') as f:
            f.write(r.content)