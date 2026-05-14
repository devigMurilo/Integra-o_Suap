import token
import requests
from django.shortcuts import render

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .suap_service import pegar_dados_aluno
from .suap_service import autenticar_suap



@api_view(['POST'])
def login_suap(request):
    matricula = request.data.get('username')
    password = request.data.get('password')
    
    acess_token = autenticar_suap(matricula, password)
    
    if not acess_token:
        return Response({'error': 'Falha na autenticação'}, status=400)
    usuario = pegar_dados_aluno(acess_token)
    return Response({
        'token': acess_token,
        'usuario': usuario
    })

@api_view(['GET'])
def dados_aluno_view(request):

    token = request.headers.get('Authorization')

    if not token:
        return Response(
            {'error': 'Token não fornecido'},
            status=400
        )

    token = token.replace("Bearer ", "")

    usuario = pegar_dados_aluno(token)

    return Response(usuario)

