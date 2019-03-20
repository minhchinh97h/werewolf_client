import React, { Component } from 'react'

import GetAdmin from './GetAdmin/GetAdmin'
import NumberOfPlayers from './NumberOfPlayers/NumberOfPlayers'
import StartBttn from './StartBttn/StartBttn'
import socketIOClient from 'socket.io-client'

import serverUrl from '../../../../serverUrl'

class NavBar extends Component{
    _isMounted = false

    state = {
        
    }

    componentDidMount(){
        this._isMounted = true
        const socket = socketIOClient(serverUrl + 'start-game')

        socket.on('connect', () => {
            socket.emit('StartGame', this.props.roomid)
        })

        socket.on('RedirectToGameRoom', data => {
            if(data === "ok" && this._isMounted)
                this.props.history.push(`/game-room/` + this.props.roomid)
        })
    }

    componentWillUnmount(){
        this._isMounted = false
    }

    render(){
        return(
            <>
                { this.props.ifAdmin ? 
                    <div className="start-button-section">
                        <StartBttn roomid = {this.props.roomid} username = {this.props.username} />
                    </div>

                    :

                    null
                }
                
            </>
        )
    }
}

export default NavBar