from django.shortcuts import render
import json
from django.forms.models import model_to_dict
from django.http import JsonResponse, HttpResponse
from .models import Run


def root(request):
  res = {}
  # if self.get_current_user():
  #   res = model_to_dict(self.current_user, fields=['id', 'email'])
  context = {'response': json.dumps(res)}
  return render(request, 'root.html', context)



def run(request,id=None):
  if not id:
    wpts = json.loads(request.body.decode('utf-8'))
    r=Run.objects.create(waypoints=wpts)
    return HttpResponse(status=204)
  else:
    return HttpResponse(status=204)
