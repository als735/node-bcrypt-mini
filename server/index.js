require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const massive = require('massive');

const app = express();

app.use(express.json());

let { SERVER_PORT, CONNECTION_STRING, SESSION_SECRET } = process.env;

//middlewares 
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);

massive(CONNECTION_STRING).then(db => {
  app.set('db', db);
});

// endpoints 
//endpoint for users to sign up and create an account 
app.post('/auth/signup', async (req, res) => {
  let {email, password} = req.body; // receives email and password props on req.body 
  let db = req.app.get('db') 
  let userFound = await db.check_user_exists([email]);  //checking if the user has already signed up using the check_user_exists sql statement in db/ 
  if (userFound[0]) {
    return res.status(200).send('Email already exists') // user already exists 
  } // if they haven't signed up, then encrypt their password using bcrypts 
  let salt = bcrypt.genSaltSync(10); 
  let hash = bcrypt.hashSync(password, salt); 
  let createdUser = await db.create_customer([email, hash]) // add the users email and hashed password to the db using the create user statement in db/ 
  req.session.user = {id: createdUser[0].id, email: createdUser[0].email}
  res.status(200).send(req.session.user) // put the user object on session sans the hashed password so we can reference them in other endpoints in our server and send the new users data back to the client side. 
}); 

//endpoint for checking if correct username and password has entered 

app.post('/auth/login', async (req, res) => {
  let {email, password} = req.body;
  let db = req.app.get('db')
  let userFound = await db.check_user_exists(email) 
  if (!userFound[0]) { // is the user in the database? if they aren't send an error 
    return res.status(200).send('Incorrect email. Please try again.'); 
  }
  let result = bcrypt.compareSync(password, userFound[0].user_password)
  if (result) { // if they are in the database use compareSync to compare the input password on req.body with the users user_password if they match then the user has authenticated, 
    req.session.user = {id: userFound[0].id, email: userFound[0].email}
    res.status(200).send(req.session.user) //and then you should put the users object on the session and send it to the client 
  } else {
    return res.status(401).send('Incorrect email/password') 
  }
}); 

//endpoint for logging out 
app.get('/auth/logout', (req, res) => {
  req.session.destroy();
  res.sendStatus(200);
}); // destroys the users session and sends a status of 200 

// endpoint to check if the user is logged in and pull their info up if they are  
app.get('/auth/user', (req, res) => {
  if (req.session.user) {  // is there a user on session? 
    res.status(200).send(req.session.user) // if there is send it up 
  } else {
    res.status(401).send('please log in') //if not send an error 
  }
});

app.listen(SERVER_PORT, () => {
  console.log(`Listening on port: ${SERVER_PORT}`);
});
