import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
import { get } from 'http';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      loggedInUser: {}
    };
  }

  async login() {
    let {email, password} = this.state; 
    let res = await axios.post('/auth/login', {
      email, 
      password
    }); // The body is an object with our email and password from state assigned as properties on the object.

    this.setState({loggedInUser: res.data, email: '', password: ''}); 
  } // When the response comes back, we set the returned user on state and reset the username and password fields.


  async signup() {
    let {email, password} = this.state; 
    let res = await axios.post('/auth/signup', {
       email,
       password
      }); 
    this.setState({loggedInUser: res.data, email: '', password: ''}); 
  } // It makes the post request, sets the returned user on state, and resets the input fields.


  logout() {
    axios.get('/auth/logout');
    this.setState({ loggedInUser: {} });
  } //logout functionality sets the loggedInUser on state back to an empty object 

  render() {
    let { loggedInUser, email, password } = this.state;
    return (
      <div className="form-container done">
        <div className="login-form">
          <h3>Auth w/ Bcrypt</h3>
          <div>
            <input
              value={email}
              onChange={e => this.setState({ email: e.target.value })}
              type="text"
              placeholder="Email"
            />
          </div>
          <div>
            <input
              value={password}
              type="password"
              onChange={e => this.setState({ password: e.target.value })}
              placeholder="password"
            />
          </div>
          {loggedInUser.email ? (
            <button onClick={() => this.logout()}>Logout</button>
          ) : (
            <button onClick={() => this.login()}>Login</button>
          )}
          <button onClick={() => this.signup()}>Sign up</button>
        </div>

        <hr />

        <h4>Status: {loggedInUser.email ? 'Logged In' : 'Logged Out'}</h4>
        <h4>User Data:</h4>
        <p> {loggedInUser.email ? JSON.stringify(loggedInUser) : 'No User'} </p>
        <br />
      </div>
    );
  }
}

export default App;
