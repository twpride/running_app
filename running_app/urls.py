
from django.urls import path, include, re_path
from run_tracker import views as tracker

from django.views.generic import TemplateView

urlpatterns = [
    # path('admin/', admin.site.urls),
    path('', tracker.root),
    path('api/run', tracker.run),
    path('api/run/<int:id>', tracker.run),
    path(
        'manifest.json',
        TemplateView.as_view(template_name="manifest.json",
                             content_type='application/manifest+json'),
        name='manifest',
    ),
    re_path(r'^.*$', tracker.root),
    # path('__debug__/', include(debug_toolbar.urls)),
]