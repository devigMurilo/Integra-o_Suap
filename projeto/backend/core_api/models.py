from django.db import models

# Create your models here.
class Disciplina(models.Model):
    nome = models.CharField(max_length=100)
    professor = models.CharField(max_length=100)
    media = models.FloatField()
    faltas = models.IntegerField()


    def __str__(self):
        return self.nome
