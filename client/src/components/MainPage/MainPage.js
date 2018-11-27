import React, { Component } from 'react'

import DisplayPlayerNames from './WaitingRoom/DisplayPlayerNames/DisplayPlayerNames'

import DisplayCards from './WaitingRoom/DisplayCards/DisplayCards'

import NavBar from './WaitingRoom/NavBar/NavBar'

class MainPage extends Component{

    state = {
        
    }

    componentDidMount(){
        
    }

    render(){
        return(
            <div>
                Hello
                <br></br>
                <div className = "display-player-names">
                    <DisplayPlayerNames roomid = {this.props.roomid} />
                </div>
                <div className = "display-cards">
                    <DisplayCards roomid = {this.props.roomid} username={this.props.username} />
                </div>
                <div className = "navbar">
                    <NavBar roomid = {this.props.roomid} username={this.props.username} />
                </div>
            </div>
        ) 
    }
}

export default MainPage
