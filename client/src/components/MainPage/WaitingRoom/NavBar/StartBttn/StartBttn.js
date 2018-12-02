import React, { Component } from 'react'

import socketIOClient from 'socket.io-client'

const serverUrl = 'http://192.168.1.3:3001/'



class StartBttn extends Component{

    startGameBttn = (e) => {
        const socket = socketIOClient(serverUrl + 'start-game') 

        socket.on('connect', () => {
            socket.emit('GetRoleAssigned', this.props.roomid)
        })

    }

    componentDidMount(){
        const socket = socketIOClient(serverUrl + 'start-game') 

        socket.on('connect', () => {
            socket.emit('StartGame', this.props.roomid)
        })

        socket.on('DisplayRoleAssigned', data => {
            console.log(data)
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