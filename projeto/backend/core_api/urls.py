from django.urls import path
from .views import login_suap
from rest_framework import routers
from .views import DisciplinaViewSet

route = routers.DefaultRouter()
route.register(r'disciplinas', DisciplinaViewSet)

urlpatterns = [
    path('login/', login_suap, name='login_suap'),
]
urlpatterns = route.urls