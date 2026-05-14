from django.urls import path
from .views import login_suap, dados_aluno_view, meu_boletim_view




urlpatterns = [
    path('login/', login_suap, name='login_suap'),
    path('dados-aluno/', dados_aluno_view, name='pegar_dados_aluno'),
    path('meu-boletim/<str:ano_letivo>/<str:periodo_letivo>/', meu_boletim_view, name='pegar_meu_boletim'),
]
