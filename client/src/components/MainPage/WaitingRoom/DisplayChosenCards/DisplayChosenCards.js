import React, { Component } from 'react'

import rolesLimit from '../../../../validation/number-of-cards-depending-on-number-of-players/numberOfCards'
import socketIOClient from 'socket.io-client'

const serverUrl = 'http://192.168.1.3:3001/'

let cards = []

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