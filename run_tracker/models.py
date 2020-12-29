from django.db import models

# Create your models here.


class Run(model.model):
  date_added = models.DateTimeField(auto_now_add=True)


class Waypoint(model.model):
  
