import React, { Component } from 'react';
import './App.css';
import { Route } from 'react-router-dom'
import Welcome from './components/Welcome/Welcome'
import Login from './components/Login/Login'
import Footer from './components/Footer/Footer'
import {WaitingRoom} from './components/MainPage/WaitingRoom/WaitingRoom'
import InGameRoom from './components/MainPage/InGameRoom/InGameRoom'

class App extends Component {
  
  componentDidMount() {
  }

  render() {
    return (
      <div className="App">
        <Route exact path="/" component={Welcome}/>
        <Route path="/login" component={Login} />
        <Route exact path="/waiting-room/:roomid/:username" component = {WaitingRoom} />
        <Route exact path="/in-game-room/:roomid/:username" component = {InGameRoom} />

        <Footer />
      </div>
    );
  }
}

export default App;