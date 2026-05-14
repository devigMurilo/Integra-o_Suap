from django.urls import path
from .views import login_suap, dados_aluno_view




urlpatterns = [
    path('login/', login_suap, name='login_suap'),
    path('dados-aluno/', dados_aluno_view, name='pegar_dados_aluno'),
]
