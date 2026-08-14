import requests
import json
from datetime import datetime

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
        "ira": dados_ensino.get("ira"),
        "periodo_atual": dados_ensino.get("periodo_atual") or dados_ensino.get("semestre_referencia"),
    }

    # Tratamento para foto caso seja um path relativo
    if usuario["foto"] and usuario["foto"].startswith("/"):
        usuario["foto"] = "https://suap.ifrn.edu.br" + usuario["foto"]

    return usuario

def buscar_diarios_aluno(access_token, ano_letivo, periodo_letivo):
    """
    Busca os diários do ALUNO usando /api/ensino/diarios/{semestre}/
    Retorna DiarioSchema: { id, disciplina: { descricao, sigla, ... }, professores: [{ nome, ... }], ... }
    O semestre é passado como "2024.1" por exemplo.
    """
    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    semestre = f"{ano_letivo}.{periodo_letivo}"

    response = requests.get(
        API_URL + f"ensino/diarios/{semestre}/",
        headers=headers
    )

    print(f"[buscar_diarios_aluno] status: {response.status_code}")

    if response.status_code == 200:
        data = response.json()
        # É paginado: { results: [...], count, next, previous }
        items = data.get("results", []) if isinstance(data, dict) else data
        if items:
            print(f"[buscar_diarios_aluno] primeiro diário chaves: {list(items[0].keys())}")
            print(f"[buscar_diarios_aluno] primeiro diário: {json.dumps(items[0], indent=2, ensure_ascii=False)}")
        return items
    return []


def meu_boletim(access_token, ano_letivo, periodo_letivo):
    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    # 1. Buscar boletim
    # BoletimSchema: { codigo_diario (str), disciplina (str), situacao (str),
    #   nota_etapa_1: {nota, faltas}, nota_etapa_2, nota_etapa_3, nota_etapa_4,
    #   media_disciplina, media_final_disciplina, numero_faltas,
    #   percentual_carga_horaria_frequentada, ... }
    res_boletim = requests.get(
        API_URL + f"ensino/meu-boletim/{ano_letivo}/{periodo_letivo}/",
        headers=headers
    )

    print(f"[meu_boletim] status: {res_boletim.status_code}")

    if res_boletim.status_code != 200:
        return {"results": []}

    boletim_data = res_boletim.json()
    results = boletim_data.get("results", []) if isinstance(boletim_data, dict) else boletim_data

    if results:
        print(f"[meu_boletim] primeiro item chaves: {list(results[0].keys())}")
        print(f"[meu_boletim] primeiro item: {json.dumps(results[0], indent=2, ensure_ascii=False)}")

    # 2. Buscar diários do aluno (tem nome completo da disciplina e professores)
    diarios = buscar_diarios_aluno(access_token, ano_letivo, periodo_letivo)

    # 3. Indexar diários por id (que corresponde ao codigo_diario do boletim)
    # DiarioSchema: { id (int), disciplina: { descricao, sigla, ... }, professores: [{ nome, ... }] }
    diarios_por_id = {}
    diarios_por_sigla = {}
    for d in diarios:
        if isinstance(d, dict):
            diario_id = d.get("id")
            if diario_id is not None:
                diarios_por_id[str(diario_id)] = d
            disc = d.get("disciplina")
            if isinstance(disc, dict) and disc.get("sigla"):
                diarios_por_sigla[disc["sigla"].lower().strip()] = d

    # 4. Enriquecer cada item do boletim
    for i, item in enumerate(results):
        diario = None

        # Tentar pelo codigo_diario → diário id
        codigo_diario = item.get("codigo_diario")
        if codigo_diario:
            diario = diarios_por_id.get(str(codigo_diario))

        # Tentar pelo nome da disciplina (que no boletim é uma string)
        if not diario:
            nome_disc = item.get("disciplina", "")
            if isinstance(nome_disc, str):
                nome_lower = nome_disc.lower().strip()
                # Comparar com a sigla do diário
                if nome_lower in diarios_por_sigla:
                    diario = diarios_por_sigla[nome_lower]
                else:
                    # Comparar com a descrição
                    for d in diarios:
                        if isinstance(d, dict):
                            disc = d.get("disciplina", {})
                            if isinstance(disc, dict):
                                desc = (disc.get("descricao") or "").lower().strip()
                                sigla = (disc.get("sigla") or "").lower().strip()
                                if (desc and nome_lower and (nome_lower in desc or desc in nome_lower)) or \
                                   (sigla and nome_lower and (nome_lower in sigla or sigla in nome_lower)):
                                    diario = d
                                    break

        # Fallback por posição
        if not diario and i < len(diarios) and isinstance(diarios[i], dict):
            diario = diarios[i]

        if diario:
            # Extrair professores
            profs = diario.get("professores", [])
            if profs and isinstance(profs, list):
                nomes = []
                for p in profs:
                    if isinstance(p, dict):
                        nomes.append(p.get("nome") or p.get("nome_usual") or "")
                    elif isinstance(p, str):
                        nomes.append(p)
                item["professor"] = ", ".join([n for n in nomes if n])
            else:
                item["professor"] = ""

            # Extrair nome completo da disciplina
            disc = diario.get("disciplina")
            if isinstance(disc, dict):
                item["nome_disciplina"] = disc.get("descricao") or disc.get("sigla") or ""
        else:
            item["professor"] = ""

        # Garantir nome_disciplina
        if not item.get("nome_disciplina"):
            item["nome_disciplina"] = item.get("disciplina", "Disciplina")

    return {"results": results}

def _normalizar_data(valor):
    """
    O SUAP devolve datas em formatos diferentes dependendo do endpoint
    ("dd/mm/aaaa", "aaaa-mm-dd", com ou sem hora). Aqui tudo vira "aaaa-mm-dd"
    para o frontend não precisar adivinhar.
    """
    if not valor or not isinstance(valor, str):
        return None

    texto = valor.strip()
    if not texto:
        return None

    # Corta a hora, se vier junto
    texto = texto.replace("T", " ").split(" ")[0]

    formatos = ["%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%d/%m/%y"]
    for formato in formatos:
        try:
            return datetime.strptime(texto, formato).strftime("%Y-%m-%d")
        except ValueError:
            continue

    return None


def _buscar_paginado(url, access_token, rotulo, max_paginas=20):
    """
    Os endpoints de aulas/avaliações são paginados (10 itens por página).
    Sem percorrer as páginas o mês vem cortado no meio.
    """
    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    itens = []
    pagina = 1

    while pagina <= max_paginas:
        response = requests.get(url, headers=headers, params={"page": pagina})

        print(f"[{rotulo}] página {pagina} status: {response.status_code}")

        if response.status_code != 200:
            break

        data = response.json()

        if not isinstance(data, dict):
            itens.extend(data or [])
            break

        resultados = data.get("results", [])
        itens.extend(resultados)

        # Sem próxima página ou página vazia: acabou
        if not data.get("next") or not resultados:
            break

        pagina += 1

    return itens


def minhas_aulas(access_token, ano, mes):
    """
    Aulas registradas no mês. AulaAlunoSchema:
    { id, etapa, conteudo, data, qtd_aulas, faltas, disciplina }
    """
    items = _buscar_paginado(
        API_URL + f"ensino/minhas-aulas/{ano}/{mes}/",
        access_token,
        "minhas_aulas"
    )

    aulas = []
    for item in items or []:
        if not isinstance(item, dict):
            continue
        aulas.append({
            "id": item.get("id"),
            "tipo": "aula",
            "data": _normalizar_data(item.get("data")),
            "disciplina": item.get("disciplina") or "Disciplina",
            "conteudo": item.get("conteudo") or "",
            "etapa": item.get("etapa") or "",
            "qtd_aulas": item.get("qtd_aulas") or 0,
            "faltas": item.get("faltas") or 0,
        })

    return aulas


def proximas_avaliacoes(access_token):
    """
    Avaliações agendadas. ItemConfiguracaoAvaliacaoSchema:
    { id, tipo, sigla, descricao, data, nota_maxima, peso, diario, etapa }
    """
    items = _buscar_paginado(
        API_URL + "ensino/minhas-proximas-avaliacoes/",
        access_token,
        "proximas_avaliacoes"
    )

    avaliacoes = []
    for item in items or []:
        if not isinstance(item, dict):
            continue
        avaliacoes.append({
            "id": item.get("id"),
            "tipo": "avaliacao",
            "data": _normalizar_data(item.get("data")),
            "disciplina": item.get("diario") or "",
            "sigla": item.get("sigla") or "",
            "descricao": item.get("descricao") or "",
            "etapa": item.get("etapa") or "",
            "nota_maxima": item.get("nota_maxima"),
            "peso": item.get("peso"),
        })

    return avaliacoes


def calendario_academico(access_token, ano, periodo_letivo):
    """
    Marcos do período letivo (início/fim de etapas, fechamento, trancamento).
    Vira uma lista simples de eventos para o frontend só renderizar.
    """
    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    # O calendário do IFRN é anual: fica publicado só no período 1.
    # Pedindo o período 2 a API responde 200 com "null", então tentamos os dois.
    periodos = [periodo_letivo]
    if int(periodo_letivo) != 1:
        periodos.append(1)

    dados = None
    for periodo in periodos:
        response = requests.get(
            API_URL + f"ensino/meu-calendario-academico/{ano}/{periodo}/",
            headers=headers
        )

        print(f"[calendario_academico] {ano}.{periodo} status: {response.status_code}")

        if response.status_code != 200:
            continue

        payload = response.json()
        if isinstance(payload, dict):
            dados = payload
            break

    if not dados:
        return []

    # Campo do schema -> rótulo mostrado na tela
    marcos = [
        ("data_inicio", "Início do período letivo"),
        ("data_fim", "Fim do período letivo"),
        ("data_inicio_etapa_1", "Início da 1ª etapa"),
        ("data_fim_etapa_1", "Fim da 1ª etapa"),
        ("data_inicio_etapa_2", "Início da 2ª etapa"),
        ("data_fim_etapa_2", "Fim da 2ª etapa"),
        ("data_inicio_etapa_3", "Início da 3ª etapa"),
        ("data_fim_etapa_3", "Fim da 3ª etapa"),
        ("data_inicio_etapa_4", "Início da 4ª etapa"),
        ("data_fim_etapa_4", "Fim da 4ª etapa"),
        ("data_inicio_trancamento", "Início do trancamento"),
        ("data_fim_trancamento", "Fim do trancamento"),
        ("data_fechamento_periodo", "Fechamento do período"),
    ]

    eventos = []
    for campo, rotulo in marcos:
        data = _normalizar_data(dados.get(campo))
        if data:
            eventos.append({
                "id": f"{campo}-{data}",
                "tipo": "academico",
                "data": data,
                "titulo": rotulo,
                "descricao": dados.get("descricao") or "",
            })

    return eventos


def meu_calendario(access_token, ano, mes):
    """
    Junta aulas do mês, avaliações e marcos do calendário acadêmico
    num payload só, para a página Calendário fazer uma requisição apenas.
    """
    mes_int = int(mes)
    periodo_letivo = 1 if mes_int <= 6 else 2

    aulas = minhas_aulas(access_token, ano, mes)
    avaliacoes = proximas_avaliacoes(access_token)
    academico = calendario_academico(access_token, ano, periodo_letivo)

    return {
        "ano": int(ano),
        "mes": mes_int,
        "periodo_letivo": periodo_letivo,
        "aulas": aulas,
        "avaliacoes": avaliacoes,
        "academico": academico,
    }
