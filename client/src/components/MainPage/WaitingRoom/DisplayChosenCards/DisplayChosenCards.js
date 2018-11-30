import React, { Component } from 'react'

import socketIOClient from 'socket.io-client'

const serverUrl = 'http://192.168.1.3:3001/'


class DisplayChosenCards extends Component{

    state = {
        renderLimits: null
    }

    componentDidMount(){

        const socket = socketIOClient(serverUrl + 'get-cards', {
            query: {
                roomid: this.props.roomid
            }
        })

        socket.on('connect', () => {
            socket.emit('JoinRoom', this.props.roomid)
        })

        socket.on('GetCards', data => {
            
            for(let key in data){
                if(data.hasOwnProperty(key)){
                    
                }
            }
        })
    }

    render(){
        return(
            <>
                {this.state.renderLimits}
            </>
        )
    }
}

export default DisplayChosenCards