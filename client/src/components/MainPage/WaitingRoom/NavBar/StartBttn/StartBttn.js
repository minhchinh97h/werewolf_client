import React, { Component } from 'react'

import socketIOClient from 'socket.io-client'

import serverUrl from '../../../../../serverUrl'

class StartBttn extends Component{

    startGameBttn = (e) => {
        const socket = socketIOClient(serverUrl + 'start-game') 

        socket.on('connect', () => {
            socket.emit('start', this.props.roomid)
        })

    }

    componentDidMount(){
        const socket = socketIOClient(serverUrl + 'start-game') 

        socket.on('connect', () => {
            socket.emit('JoinRoom', this.props.roomid)
        })
    }

    render(){
        return(
            <>
                <button type='button' onClick={this.startGameBttn}>Start the game</button>
            </>
        )
    }
}

export default StartBttn