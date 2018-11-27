import React, { Component } from 'react'

import DisplayPlayerNames from './DisplayPlayerNames/DisplayPlayerNames'

import DisplayCards from './DisplayCards/DisplayCards'

import StartBttn from './NavBar/StartBttn/StartBttn'


const serverUrl = 'http://192.168.1.3:3001/'

class MainPage extends Component{

    state = {
        
    }

    componentDidMount(){
        
    }

    render(){
        return(
            <div>
                hello
                <br></br>
                <div className = "display-player-names">
                    <DisplayPlayerNames roomid = {this.props.roomid} />
                </div>
                <div className = "display-cards">
                    <DisplayCards />
                </div>
                <div className = "start-bttn">
                    <StartBttn roomid = {this.props.roomid} username = {this.props.username} />
                </div>
            </div>
        ) 
    }
}

export default MainPage
