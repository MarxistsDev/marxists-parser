import json
import requests
import os
import codecs

URL = "https://www.marxists.org/"
def downloadFromJson(filename:str, outDir:str = 'www', dir:str = 'data'):
    with open(f'./{dir}/{filename}.json') as jsn:
        for i in json.load(jsn):
            if i['href'].endswith('.html') or i['href'].endswith('.htm'):
                r = requests.get(URL+i['href'])
                r.encoding = r.apparent_encoding
                if '<title>Object not found!</title>' not in r.text:
                    print(i['href'])
                    with codecs.open(os.path.join(outDir, i['href'].replace('/', '.')), 'wb') as f:
                        f.write(r.content)

#downloadFromJson('lenin')
#downloadFromJson('authors', 'authors')
downloadFromJson('glossary_index', 'glossary')