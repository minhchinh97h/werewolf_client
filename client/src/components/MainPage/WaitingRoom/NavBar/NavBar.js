import React, { Component } from 'react'

import GetAdmin from './GetAdmin/GetAdmin'
import NumberOfPlayers from './NumberOfPlayers/NumberOfPlayers'
import StartBttn from './StartBttn/StartBttn'

import socketIOClient from 'socket.io-client'

const serverUrl = 'http://192.168.1.3:3001/'

class NavBar extends Component{

    state = {
        ifAdmin: false,
        admin: "",
        numberOfPlayers: 0,
    }

    componentDidMount(){
        const socket = socketIOClient(serverUrl + 'get-admin', {
            query: {
                roomid: this.props.roomid
            }
        })

        socket.on('connect', () => {
            socket.emit('JoinRoom', this.props.roomid)
        })

        socket.on('GetAdmin', data => {
            this.setState({
                admin: data.admin,
                numberOfPlayers: data.numberOfPlayers
            })

            if(this.props.username === data.admin){
                this.setState({
                    ifAdmin: true
                })
            }
            else{
                this.setState({
                    ifAdmin: false
                })
            }
        })
    }
    render(){
        return(
            <>
                <div className="admin-section">
                    <GetAdmin admin={this.state.admin} />
                </div>
                <div className="number-of-player-section">
                    <NumberOfPlayers numberOfPlayers = {this.state.numberOfPlayers} roomid = {this.props.roomid}/>
                </div>

                { this.state.ifAdmin ? 
                    <div className="start-button-section">
                        <StartBttn />
                    </div>

                    :

                    null
                }
                
            </>
        )
    }
}

export default NavBar