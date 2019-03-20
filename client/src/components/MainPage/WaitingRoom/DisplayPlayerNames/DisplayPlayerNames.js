import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'
import serverUrl from '../../../../serverUrl'

import "./DisplayPlayerNames.css"

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
                this.setState({renderPlayerNames: data.map(player => {return(<div key = {player} className="player-name-holder"><p>{player}</p></div>)})})
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