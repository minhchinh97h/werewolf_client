import React, { Component } from 'react'

import DisplayPlayerNames from './DisplayPlayerNames/DisplayPlayerNames'
import DisplayCards from './DisplayCards/DisplayCards'
import DisplayChosenCards from './DisplayChosenCards/DisplayChosenCards'
import NavBar from './NavBar/NavBar'

class WaitingRoom extends Component{

    state = {
        
    }

    componentDidMount(){
    }

    render(){
        return(
            <div>
                <br></br>
                <div className = "display-player-names">
                    <DisplayPlayerNames roomid = {this.props.roomid} />
                </div>
                <div className = "display-cards">
                    <DisplayCards roomid = {this.props.roomid} username={this.props.username} />
                </div>
                <div className = "display-chosen-cards-section">
                    <DisplayChosenCards roomid = {this.props.roomid} />
                </div>
                <div className = "navbar">
                    <NavBar roomid = {this.props.roomid} username={this.props.username} />
                </div>
            </div>
        ) 
    }
}

export default WaitingRoom