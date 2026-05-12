from django.urls import path
from .views import aluno

urlpatterns = [
    path('aluno/', aluno, name='aluno'),
]