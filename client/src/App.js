import React, { Component } from 'react';
import './App.css';
import { Route, BrowserRouter } from 'react-router-dom'
import Welcome from './components/Welcome/Welcome'
import Login from './components/Login/Login'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import {WaitingRoom} from './components/MainPage/WaitingRoom/WaitingRoom'
import InGameRoom from './components/MainPage/InGameRoom/InGameRoom'


class App extends Component {
  constructor(props){
    super(props)

    if(performance.navigation.type === 1)
      console.log("page reloaded")
  }

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