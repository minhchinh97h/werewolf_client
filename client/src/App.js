import React, { Component } from 'react';
import './App.css';
import { Route, BrowserRouter } from 'react-router-dom'
import Welcome from './components/Welcome/Welcome'
import Login from './components/Login/Login'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import WaitingRoom from './components/MainPage/WaitingRoom/WaitingRoom'
import InGameRoom from './components/MainPage/InGameRoom/InGameRoom'


class App extends Component {
  componentDidMount() {
  }

  RenderWaitingRoom( { match } ){
    return <WaitingRoom roomid = {match.params.roomid} username = {match.params.username} />
    
  }

  RenderInGameRoom( { match } ){
    return <InGameRoom roomid = {match.params.roomid} username = {match.params.username} />
  }

  render() {
    return (
      <div className="App">
        <Route exact path="/" component={Welcome}/>
        <Route path="/login" component={Login} />
        <Route exact path="/waiting-room/:roomid/:username" component = {WaitingRoom} />
        <Route exact path="/in-game-room/:roomid/:username" component = {InGameRoom} />

        <div className="Header-Footer">
          <Header />
          <Footer />
        </div>
      </div>
    );
  }
}

export default App;