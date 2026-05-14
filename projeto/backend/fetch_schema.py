import requests
import re
import json

r = requests.get('https://suap.ifrn.edu.br/api/docs/')
match = re.search(r'url:\s*"([^"]+)"', r.text)
if match:
    schema_url = "https://suap.ifrn.edu.br" + match.group(1)
    print("Schema URL:", schema_url)
    r2 = requests.get(schema_url)
    with open('schema.json', 'w', encoding='utf-8') as f:
        f.write(r2.text)
    data = r2.json()
    paths = data.get('paths', {}).keys()
    for p in paths:
        if 'aluno' in p or 'boletim' in p or 'ensino' in p or 'meus-dados' in p:
            print(p)
else:
    print("No schema url found in docs html")
