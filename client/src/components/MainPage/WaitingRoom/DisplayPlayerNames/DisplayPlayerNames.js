import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'

const serverUrl = 'http://localhost:3001/'

class DisplayPlayerNames extends Component{
    state = {
        renderPlayerNames: null
    }

    componentDidMount(){
        const socket = socketIOClient(serverUrl + 'main-page')
        socket.on('connect', () => {
            socket.emit('RequestToGetPlayersAndJoinRoom', this.props.roomid)
        })

        socket.on('GetPlayers', data => {this.setState({renderPlayerNames: data.map(player => {return(<div key = {player}><p>{player}</p></div>)})})})
    }

    render(){
        return(
            <>
                {this.state.renderPlayerNames}
            </>
        )
    }
}


export default DisplayPlayerNames