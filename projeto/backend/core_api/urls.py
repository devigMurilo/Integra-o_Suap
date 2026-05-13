from django.urls import path
from .views import login_suap
from rest_framework import routers




urlpatterns = [
    path('login/', login_suap, name='login_suap'),
]

