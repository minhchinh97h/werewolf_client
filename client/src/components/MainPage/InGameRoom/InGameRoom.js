import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'

const serverUrl = 'http://192.168.1.3:3001/'


class InGameRoom extends Component{

    state = {
        renderPlayerRole: null
    }

    componentDidMount(){
        const socket = socketIOClient(serverUrl + 'in-game')

        socket.on('connect', () => {
            socket.emit('JoinRoom', this.props.match.params.roomid)
        })

        socket.on('RetrieveGameInfo', data => {
            data.forEach((row) => {
                if(row.name === this.props.match.params.username)

                    this.setState({
                        renderPlayerRole: <b>You are {row.role}</b>
                    })
            });
        })
    }

    render(){
        return(
            <> 
            {this.state.renderPlayerRole}
            </>
        ) 
    }
}

export default InGameRoom