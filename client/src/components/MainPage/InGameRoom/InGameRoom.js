import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'

const serverUrl = 'http://192.168.1.3:3001/'

let gameInfo

class InGameRoom extends Component{

    state = {
        renderPlayerRole: null,
        timer: null
    }

    componentDidMount(){
        const socket = socketIOClient(serverUrl + 'in-game')

        socket.on('connect', () => {
            socket.emit('JoinRoom', this.props.match.params.roomid)
        })

        socket.on('RetrieveGameInfo', data => {
            gameInfo = data
            data.forEach((row) => {
                if(row.name === this.props.match.params.username)

                    this.setState({
                        renderPlayerRole: <b>You are {row.role}</b>
                    })
            });
        })

        socket.on('RetrieveGameTurn', data => {
            
        })
        let currentSecond = 10

        let timer = setInterval(() => {
            this.setState({
                timer: currentSecond
            })
            currentSecond--

            if(currentSecond < 0){
                clearInterval(timer)
                socket.emit('RequestToStartTheGame', this.props.match.params.roomid)
            }
            
        }, 1000)
        

        
            
            
    }

    render(){
        return(
            <> 
            {this.state.renderPlayerRole}
            <br></br>

            <p>The game will start after {this.state.timer}</p>
            </>
        ) 
    }
}

export default InGameRoom