import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'

const serverUrl = 'http://192.168.1.3:3001/'


class InGameRoom extends Component{

    state = {
        renderPlayerRole: null
    }

    componentDidMount(){
        const socket = socketIOClient(serverUrl + 'start-game')

        socket.on('connect', () => {
            socket.emit('JoinRoom', this.props.match.params.roomid)
        })

        socket.on('GetRoleAssigned', data => {
            data.forEach((player) => {
                if(player.name === this.props.match.params.username)
                    this.setState({
                        renderPlayerRole: <p>{player.role}</p>
                    })
            });
        })
    }

    render(){
        return(
            <>
                <div className="in-game-display-role">
                     <b>You are: {this.state.render}</b>
                </div>
            </>
        ) 
    }
}

export default InGameRoom