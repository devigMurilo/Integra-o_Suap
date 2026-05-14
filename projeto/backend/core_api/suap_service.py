import requests

API_URL = "https://suap.ifrn.edu.br/api/v2/"

def autenticar_suap(matricula, password):

    token_url = API_URL + "token/pair"

    data = {
        "username": matricula,
        "password": password
    }

    response = requests.post(token_url, json=data)

    print("STATUS CODE:")
    print(response.status_code)

    print("RESPOSTA:")
    print(response.text)

    try:
        token_data = response.json()
    except Exception as e:
        print("ERRO JSON:")
        print(e)
        return None

    return token_data.get("access")


def pegar_dados_aluno(access_token):

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    response = requests.get(
        API_URL + "minhas-informacoes/meus-dados/",
        headers=headers
    )

    print("STATUS:")
    print(response.status_code)

    print("TEXTO:")
    print(response.text)

    try:
        return response.json()
    except Exception as e:
        return {
            "erro": "Resposta não é JSON",
            "status": response.status_code,
            "texto": response.text
        }
