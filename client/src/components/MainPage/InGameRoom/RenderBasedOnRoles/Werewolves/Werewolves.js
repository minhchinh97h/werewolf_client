import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'

import GetPlayers from '../../GetPlayers/GetPlayers'

const serverUrl = 'http://192.168.1.3:3001/'

class Werewolves extends Component{

    state = {
        renderUI: null,
        renderPlayers: null,
        persontoKill: null
    }

    killBttn = () => {

    }

    componentDidMount(){
        const getPlayerSocket = socketIOClient(serverUrl + 'main-page', {
            query: {
                roomid : this.props.roomid
            }
        } )
        getPlayerSocket.on('GetPlayersAt' + this.props.roomid, data => {this.setState({
            renderPlayers: data.map(player => {
                if(player !== this.props.username){
                    return(
                        <div key = {player}>
                            <button type="button" onClick={this.killBttn.bind(this, player)}>{player}</button>
                        </div>
                    )
                }
            })
        })})

        const socket = socketIOClient(serverUrl + 'in-game')

        let currentSecond = 10

        socket.on('RetrieveGameStart1stRound', data => {
            if(data === 'ok'){
                let timer = setInterval(() => {
                    currentSecond--

                    if(currentSecond < 0){
                        socket.emit('RequestToGet1stTurn', this.props.roomid)
                    }
                }, 1000)
            }
        })

        socket.on('Retrieve1stTurn', data => {
            if(data === this.props.username){
                this.setState({
                    renderUI: <>
                        <div>
                            <p>Who do you want to kill?</p>
                        </div>
                    </>
                })
            }
        })
    }

    render(){
        return(
            <>
                {this.state.renderUI}

                <b></b>
                
                {this.state.renderPlayers}
            </>
        )
    }
}   

export default Werewolves