import requests
from getpass import getpass

api_url = "https://suap.ifrn.edu.br/api/"

def autenticar_suap(user, password):
    user = input("user: ")
    password = getpass()

    data = {"username":user,"password":password}

    response = requests.post(api_url+"v2/autenticacao/token/", json=data)
    token = response.json()["access"]
    return token

def pegar_dados_aluno(token):
    headers = {
        "Authorization": f'Bearer {token}'
    }
    response = requests.get(api_url+"v2/minhas-informacoes/", headers=headers)
       
    return response.json()


 
