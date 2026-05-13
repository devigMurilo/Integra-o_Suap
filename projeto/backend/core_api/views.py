import token
import requests
from django.shortcuts import render

# Create your views here.

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import viewsets
from .models import Disciplina
from .serializers import DisciplinaSerializer

from .suap_service import pegar_dados_aluno, autenticar_suap



@api_view(['POST'])
def login_suap(request):
    matricula = request.data.get('username')
    password = request.data.get('password')
    
    acess_token = autenticar_suap(matricula, password)
    
    if not acess_token:
        return Response({'error': 'Falha na autenticação'}, status=400)
    usuario = pegar_dados_aluno(acess_token.data['token'])
    return Response({
        'token': acess_token.data['token'],
        'usuario': usuario
    })
    
