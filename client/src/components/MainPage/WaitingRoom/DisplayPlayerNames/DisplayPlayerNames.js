import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'

const serverUrl = 'http://localhost:3001/'

class DisplayPlayerNames extends Component{
    _isMounted = false

    state = {
        renderPlayerNames: null
    }

    componentDidMount(){
        this._isMounted = true

        const socket = socketIOClient(serverUrl + 'main-page')
        socket.on('connect', () => {
            socket.emit('RequestToGetPlayersAndJoinRoom', this.props.roomid)
        })

        socket.on('GetPlayers', data => 
        {
            if(this._isMounted)
                this.setState({renderPlayerNames: data.map(player => {return(<div key = {player}><p>{player}</p></div>)})})
        })
    }

    componentWillUnmount(){
        this._isMounted = false
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