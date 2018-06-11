Create a .env file with the following configuration in the root directory of the app.
Add this file to the .gitignore file to do not track this file.

```
PORT= #add port no. to serve your app from
DATABASE_URL= #URL of the mongodb server
GOOGLE_CLIENT_ID = #your google client id for google oauth
GOOGLE_CLIENT_SECRET = # your google client secret for google oauth
EMAIL_SERVICE = # the email service you would be using for this application
EMAIL_USER_NAME = #your user name on this email service
EMAIL_PASSWORD = # your password on this email service
USE_EMAIL = # whether you want to use the email service or not; either true or false
COOKIE_KEY = # the secret cookie key to encrypt the cookies
```
