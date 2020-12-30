import os
import psycopg2
import dj_database_url

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


SECRET_KEY = os.environ.get(
  'DJANGO_SECRET_KEY', 'z7t+y3%z6n&-$==3*@q#9@6b)!c+!3h1ftoqz_8su6n70mm*k%')


DEBUG = 'PROD' not in os.environ

ALLOWED_HOSTS = [
]

INSTALLED_APPS = [
  'run_tracker.apps.RunTrackerConfig',
]

MIDDLEWARE = [
  'django.contrib.sessions.middleware.SessionMiddleware', #for cookies
]

ROOT_URLCONF = 'running_app.urls'

TEMPLATES = [
  {
    'BACKEND': 'django.template.backends.django.DjangoTemplates',
    'DIRS': [os.path.join(BASE_DIR, 'templates')],
  },
]

WSGI_APPLICATION = 'running_app.wsgi.application'


ssl_require = os.environ.get('DATABASE_URL', '') != ''
DATABASES = {
  'default':
    dj_database_url.config(
      conn_max_age=600,
      ssl_require=ssl_require,
      default='postgresql://running_app_main:runningisfun!@localhost/running_app')
}


LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


SESSION_ENGINE = "django.contrib.sessions.backends.signed_cookies"

