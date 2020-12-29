from django.db import models

# Create your models here.


class Run(model.model):
  date_added = models.DateTimeField(auto_now_add=True)


class Waypoint(model.model):
  run = models.ForeignKey(Run, on_delete=models.CASCADE)
  accuracy = models.FloatField()
