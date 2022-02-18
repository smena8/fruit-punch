from django.urls import path
from . import views

app_name = 'FruitCrush'
urlpatterns = [
    path('', views.index, name='Game')
]
