import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'
import serverUrl from '../../../../serverUrl'

import "./DisplayPlayerNames.css"

let DisplayPlayerNamesSocket

class DisplayPlayerNames extends Component{
    _isMounted = false

    state = {
        renderPlayerNames: null
    }

    componentDidMount(){
        this._isMounted = true

        DisplayPlayerNamesSocket = socketIOClient(serverUrl + 'main-page')
        DisplayPlayerNamesSocket.on('connect', () => {
            DisplayPlayerNamesSocket.emit('RequestToGetPlayersAndJoinRoom', this.props.roomid)
        })

        DisplayPlayerNamesSocket.on('GetBroadCastPlayers', data => 
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


export {DisplayPlayerNames, DisplayPlayerNamesSocket}