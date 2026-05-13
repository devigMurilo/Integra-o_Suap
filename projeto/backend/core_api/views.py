import token

from django.shortcuts import render

# Create your views here.

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import viewsets
from .models import Disciplina
from .serializers import DisciplinaSerializer

from .suap_service import pegar_dados_aluno, autenticar_suap

class DisciplinaViewSet(viewsets.ModelViewSet):
    queryset = Disciplina.objects.all()
    serializer_class = DisciplinaSerializer

@api_view(['POST'])
def login_suap(request):
     matricula = request.data.get('matricula')
     password = request.data.get('password')
     
     auth= autenticar_suap(matricula, password)
     
     token = auth.get('token')
     
     if not token:
         return Response({'error': 'login falhou'}, status=401)
    
     usuario = pegar_dados_aluno(token)
     
     return Response({
         'token': token,
         'usuario': usuario
    })
    
    
     
     