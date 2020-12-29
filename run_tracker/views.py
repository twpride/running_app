from django.shortcuts import render
import json
from django.forms.models import model_to_dict
from django.http import JsonResponse


def root(request):
  res = {}
  # if self.get_current_user():
  #   res = model_to_dict(self.current_user, fields=['id', 'email'])
  context = {'response': json.dumps(res)}
  return render(request, 'root.html', context)