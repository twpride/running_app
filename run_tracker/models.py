from django.db import models

# Create your models here.


class Run(models.Model):
  date_added = models.DateTimeField(auto_now_add=True)


class Waypoint(models.Model):
  run = models.ForeignKey(Run, on_delete=models.CASCADE)
  accuracy = models.FloatField()
  altitude = models.FloatField()
  heading = models.FloatField()
  latitude = models.FloatField()
  longitude = models.FloatField()
  speed = models.FloatField()
  timestamp= models.FloatField()
