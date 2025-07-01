# Open terminal and clone the frontend branch

## Run Frontend Code

### Change Base location of Backend_Url in frontend  **terminal**

```
Go to ../frontend/src/network/baseUrl.js

export const baseURlNoAPI = "http://127.0.0.1:8000"   <----------- Change this according to your port

```


### Install the dependencies by running this command in **terminal**

```
Go to ../asset_management/frontend/

npm install
```

### Run application in browser by running this command in **terminal**

```
npm start
```

Now you can see you app rinning in browser at port number **3000**

`http://localhost:3000/`

#

#

## Run Backend Code

### Run this command in **terminal**

```
cd backend
```

### Create Virtual environment by running this comment on **terminal**

```
python -m venv venv
```

### Activate the virtual environemnt by running this command in **terminal**

```
source venv/bin/activate
```

### install all required packages by running this command in **terminal**

```
pip install -r requirements.txt
```

### Set up Local PostgreSQL Database
##### 1. Install PostgreSQL if you haven't already. Follow instructions for your OS: PostgreSQL Installation Guide.
###### https://www.postgresql.org/docs/current/tutorial-install.html

##### 2. Create a new database and user
### Open psql and run the following commands:

```
CREATE DATABASE asset_management;
CREATE USER asset_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE asset_management TO asset_user;
\q
```

### Try changing the database detail on ./backend/asset_management_back/setting.py file (change this according to your db credentials, email_host_user, email_app_password, Frontend url)

```
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'asset_management',
        'USER': 'asset_user',
        'PASSWORD': 'your_password',  # Use the password you set for the user
        'HOST': 'localhost',
        'PORT': '5432', 
    }
}
```

### Change more settings cofigurations 
```
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'  # For Gmail SMTP server
EMAIL_PORT = 587
EMAIL_USE_TLS = True  # Use TLS for secure email transfer
EMAIL_HOST_USER = '<your-mail-id>'  # add your host email
EMAIL_HOST_PASSWORD = '<your-app-password>'  #add your host password
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER 


FRONTEND_URL='http://127.0.0.1:3000'  #change this accordingly

```

### Apply Database Migrations
#### Run the following command to apply migrations and set up the database schema:
```
python manage.py makemigrations
python manage.py migrate

```

### Run the project by running this command in **terminal**

```
cd backend/
python manage.py create_initial_users  (for creating initial users)
python manage.py runserver
```
#

## Demo Id's for login

```
we can use following credentials for login demo:

1. mail: asset.manager@oodles.io, password: Admin@123 // Asset Manager
2. mail: customer.manager@oodles.io, password: Admin@123  // Customer Manager
3. mail: finance.manager@oodles.io, password: Admin@123 // Finance Manager
4. mail: warehouse.manager@oodles.io, password: Admin@123 // Warehouse Manager
5. mail: mk@smartxelements.de, password: Admin@123 // Asset Manager <----- for checking forget password functionality
```

#