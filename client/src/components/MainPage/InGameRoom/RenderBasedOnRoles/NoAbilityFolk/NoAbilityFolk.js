import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'

import GetPlayers from '../../GetPlayers/GetPlayers'
import serverUrl from '../../../../../serverUrl'

import "./NoAbilityFolk.css"

class NoAbilityFolk extends Component{
    _isMounted = false

    state = {
        
    }

    componentDidMount(){
        this._isMounted = true

        if(this._isMounted){

        }
    }

    componentWillUnmount(){
        this._isMounted = false
    }

    render(){
        return(
            <>
                <GetPlayers roomid = {this.props.roomid} username = {this.props.username} />
            </>
        )
    }
}   

export default NoAbilityFolk