# Talk-to-Me

A real time social network based chat app made using MEAN stack technologies i.e. Mongodb, Node.js, Angular.js, Express.js.

The app is currently deployed [here talk-to-me](http://floating-savannah-73287.herokuapp.com/#!/home)

## Features of this app

1.  User can register on the app through by registering on the system or use their google id to signup
2.  User can see all other users registered on the system and send friend request to them.
3.  User can cancel the friend requests that they have sent and accept or decline the friend requests they have received.
4.  User can chat with their friends in real time.
5.  All of users chat data is stored in the db to allow future access.
6.  User can see which of their friends are online / offline.
7.  A users can also change their password if they forget their password on the system.
8.  User will get notification when a new friend request is received or their friend requests are accepted or declined.

## Installation

You will need to install Node.js, MongoDb, Redis to run this app on your local machine

1.  clone this repository

```bash
git clone https://github.com/codemayank/talk-to-me.git
```

2.  Navigate to the folder where the repository was downloaded
3.  Create a .env file with the following configuration in the root directory of the app.
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

4.  Install all the dependencies run

```bash
npm install
```

5.  Bundle the client side code
    For production build

```bash
npm run build
```

For development build

```bash
npm run dev
```

6.  finally run

```bash
node index.js
```

7.  The app will now be running on localhost:5000

## CreatedBy

### Mayank Yadav
