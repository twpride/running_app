from django.db import models

# Create your models here.


class Run(models.Model):
  date_added = models.DateTimeField(auto_now_add=True)
  waypoints = models.JSONField()


