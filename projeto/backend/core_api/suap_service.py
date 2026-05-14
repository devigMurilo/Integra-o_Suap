import requests

API_URL = "https://suap.ifrn.edu.br/api/"

def autenticar_suap(matricula, password):

    token_url = API_URL + "/token/pair"

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

    res_eu = requests.get(
        API_URL + "rh/eu/",
        headers=headers
    )
    
    res_ensino = requests.get(
        API_URL + "ensino/meus-dados-aluno/",
        headers=headers
    )

    dados_eu = res_eu.json() if res_eu.status_code == 200 else {}
    dados_ensino = res_ensino.json() if res_ensino.status_code == 200 else {}

    # Construindo o objeto que o frontend espera
    usuario = {
        "foto": dados_eu.get("foto"),
        "nome": dados_eu.get("nome_usual") or dados_eu.get("nome"),
        "matricula": dados_eu.get("identificacao"),
        "campus": dados_eu.get("campus"),
        "email_pessoal": dados_eu.get("email_secundario"),
        
        "curso": dados_ensino.get("curso"),
        "situacao": dados_ensino.get("situacao"),
        "email_academico": dados_ensino.get("email_academico"),
    }

    # Tratamento para foto caso seja um path relativo
    if usuario["foto"] and usuario["foto"].startswith("/"):
        usuario["foto"] = "https://suap.ifrn.edu.br" + usuario["foto"]

    return usuario

def meu_boletim(access_token, ano_letivo, periodo_letivo):

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    response = requests.get(
        API_URL + f"ensino/meu-boletim/{ano_letivo}/{periodo_letivo}/",
        headers=headers
    )

    print(response.status_code)
    print(response.text)

    return response.json()