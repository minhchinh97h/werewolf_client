import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'

import GetPlayers from '../../GetPlayers/GetPlayers'

const serverUrl = 'http://192.168.1.3:3001/'

class Werewolves extends Component{

    state = {
        
    }

    componentDidMount(){
        const socket = socketIOClient(serverUrl + 'in-game')

        let currentSecond = 10

        socket.on('RetrieveGameStart1stRound', data => {
            if(data === 'ok'){
                let timer = setInterval(() => {
                    currentSecond--

                    if(currentSecond < 0){
                        socket.emit('RequestToGet1stTurn', this.props.roomid)
                    }
                }, 1000)
            }
        })

        socket.on('Retrieve1stTurn', data => {
            if(data === this.props.username){
                
            }
        })
    }

    render(){
        return(
            <>
                <GetPlayers roomid = {this.props.roomid} username = {this.props.username} />
            </>
        )
    }
}   

export default Werewolves