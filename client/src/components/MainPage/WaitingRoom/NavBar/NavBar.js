import React, { Component } from 'react'

import GetAdmin from './GetAdmin/GetAdmin'
import NumberOfPlayers from './NumberOfPlayers/NumberOfPlayers'
import StartBttn from './StartBttn/StartBttn'
import socketIOClient from 'socket.io-client'

const serverUrl = 'http://192.168.1.3:3001/'

class NavBar extends Component{

    state = {
        
    }

    componentDidMount(){
        const socket = socketIOClient(serverUrl + 'start-game')

        socket.on('connect', () => {
            socket.emit('StartGame', this.props.roomid)
        })

        socket.on('RedirectToGameRoom', data => {
            if(data === "ok")
                this.props.history.push(`/game-room/` + this.props.roomid)
        })
    }

    render(){
        return(
            <>
                <div className="admin-section">
                    <GetAdmin admin={this.props.admin} />
                </div>
                <div className="number-of-player-section">
                    <NumberOfPlayers numberOfPlayers = {this.props.numberOfPlayers} roomid = {this.props.roomid}/>
                </div>

                { this.props.ifAdmin ? 
                    <div className="start-button-section">
                        <StartBttn roomid = {this.props.roomid} />
                    </div>

                    :

                    null
                }
                
            </>
        )
    }
}

export default NavBar