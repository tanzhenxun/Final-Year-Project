### Activate
cd ~
source /usr/local/bin/venv/bin/activate  

cd /home/engineer/tezi/04_api/mqtt/a02_mqtt_django_testing

### Make a file call drinks 
django-admin startproject mqtt_django_testing .

### manage.py: A command-line utility that lets you interact with this Django project in various ways. 
### You can read all the details about manage.py in django-admin and manage.py.
python manage.py

### Starts the development server, allowing you to test your Django application locally.
python manage.py runserver
python manage.py runserver 0.0.0.0:8000

### Applies the pending migrations to your database, synchronizing the database schema with your models.
python manage.py migrate

### Add user
python manage.py createsuperuser

### Change 
python manage.py makemigrations mqtt_django_testing


python consume.py

pip install requests


u: admin
p: admin


### Run python listening
cd /home/engineer/tezi/04_api/mqtt/a03_multi_thread

python listening.py
python mqtt_sub.py

### List all keeps running in the background
screen -ls

### -S is create another screen 
screen -S mqtt

### -r is see back screen in running 
screen -r mqtt