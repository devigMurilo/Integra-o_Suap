import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response

api_url = "https://suap.ifrn.edu.br/api/"

def autenticar_suap(matricula, password):
    url = "https://suap.ifrn.edu.br/api/v2/autenticacao/token/"
    payload = {"username": matricula, "password": password}
    
    # Use requests.post, NUNCA chame autenticar_suap() aqui dentro
    response = requests.post(url, data=payload) 
    
    if response.status_code == 200:
        return {"token": response.json().get("access"), "success": True}
    return {"error": "Falha", "success": False}
def pegar_dados_aluno(token):
    try:
        url = f"{api_url}/minhas-informacoes/meus-dados/"
        
        headers = {
            "Authorization": f"Bearer {token}"
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            return response.json()
        else:
            return None
            
    except Exception as e:
        print(f"Erro ao obter dados do aluno: {e}")
        return None

def pegar_notas(token):
    try:
        url = f"{api_url}/minhas-informacoes/notas/"
        
        headers = {
            "Authorization": f"Bearer {token}"
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            return response.json()
        else:
            return None
            
    except Exception as e:
        print(f"Erro ao obter notas do aluno: {e}")
        return None


