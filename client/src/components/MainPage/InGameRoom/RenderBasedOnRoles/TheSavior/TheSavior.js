import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'

import GetPlayers from '../../GetPlayers/GetPlayers'

const serverUrl = 'http://localhost:3001/'

let players = [],
    protectTarget = ''

class TheSavior extends Component{
    _isMounted = false

    state = {
        
    }

    ProtectPlayer = (name, e) => {
        if(window.confirm("Do you want to protect " + name + "?")){
            protectTarget = name

            const socket = socketIOClient(serverUrl + 'savior')

            let sendingData = {
                roomid: this.props.roomid,
                protectTarget: protectTarget
            }

            socket.emit('RequestToProtectPlayer', sendingData)
        }
    }

    endTurnBttn = () => {
        const socket = socketIOClient(serverUrl + 'retrieve-next-turn')
        
        let sendingData = {
            roomid: this.props.roomid,
            role: 'Werewolves'
        }

        socket.emit('RequestToGetNextTurn', sendingData)
    }  

    componentDidMount(){
        _isMounted = true

        if(this._isMounted){
            // to display all the players that are from the room (every character must have)
            const getPlayerSocket = socketIOClient(serverUrl + 'main-page')

            getPlayerSocket.on('connect', () => {
                getPlayerSocket.emit('RequestToGetPlayersAndJoinRoom', this.props.roomid)
            })

            getPlayerSocket.on('GetPlayers', data => {
                this.setState({
                    renderPlayers: data.map((player, index) => {
                        if(player !== this.props.username){
                            players.push(player)
                            let id = "savior_target_bttn_" + index
    
                            return(
                                <div key = {player}>
                                    <button id={id} type="button" onClick={this.ProtectPlayer.bind(this, player)}>{player}</button>
                                </div>
                            )
                        }
                    })
                })
                
            })

            /* <-----------------------------------------------> */

            //Handle the first round (every character must have)
            const firstRoundSocket = socketIOClient(serverUrl + 'in-game')

            firstRoundSocket.on('connect', () => {
                firstRoundSocket.emit('JoinRoom', this.props.roomid)
            })

            //Retrieve the 1st turn, if the player is the first to be called, then render its ui 
            firstRoundSocket.on('Retrieve1stTurn', data => {
                if(data === this.props.username){
                    this.setState({
                        renderUI: <>
                            <div>
                                <p>Who do you want to kill?</p>
                            </div>
                        </>
                    })

                    //Savior's action
                    const saviorSocket = socketIOClient(serverUrl + 'savior')

                    saviorSocket.on('ProtectedPlayer', (data) => {
                        if(data === 'ok'){
                            alert(protectTarget + " is protected!")

                            this.setState({
                                endTurnConfirm: <button type="button" onClick={this.endTurnBttn}>End turn</button>
                            })
                        }
                    })
                }
            })

            /* <-----------------------------------------------> */

            //Handle the called turn (every character must have)
            const calledTurnSocket = socketIOClient(serverUrl + 'retrieve-next-turn')

            calledTurnSocket.on('connect', () => {
                calledTurnSocket.emit('JoinRoom', this.props.roomid)
            })

            calledTurnSocket.on('getNextTurn', data => {
                if(data === this.props.username){

                    //render UI
                    this.setState({
                        renderUI: <>
                            <div>
                                <p>Who do you want to kill?</p>
                            </div>
                        </>
                    })
        
                    //Savior's action
                    const saviorSocket = socketIOClient(serverUrl + 'savior')
        
                    saviorSocket.on('ProtectedPlayer', (data) => {
                        if(data === 'ok'){
                            alert(protectTarget + " is protected!")

                            this.setState({
                                endTurnConfirm: <button type="button" onClick={this.endTurnBttn}>End turn</button>
                            })
                        }
                    })
                }
            })

            /* <-----------------------------------------------> */

            //Handle lover (every character must have)
            const loverSocket = socketIOClient(serverUrl + 'in-game')

            loverSocket.on('RevealLovers', (data) => {
                data.forEach((info, index) => {
                    if(info.player === this.props.username){
                        if(index === 0)
                            this.setState({
                                renderLovers: <b>You are now in love with {data[index+1].player} - {data[index+1].role}</b>
                            })
                        
                        else{
                            this.setState({
                                renderLovers: <b>You are now in love with {data[index-1].player} - {data[index-1].role}</b>
                            })
                        }
                    }
                })
            })

            /* <-----------------------------------------------> */

            //Handle changes of the total charmed players via a socket event (every character must have)
            const getCharmedSocket = socketIOClient(serverUrl + 'piper')

            getCharmedSocket.on('GetListOfCharmed', (data) => {
                data.every((player) => {
                    if(this.props.username === player){
                        this.setState({
                            renderCharmedPlayers: data.map((player, index) => {
                                let key = 'charmed_' + index
                                return(
                                    <div key={key}>
                                        <p>{player}</p>
                                    </div>
                                )
                            })
                        })

                        return false
                    }

                    else
                        return true
                })
            })

            /* <-----------------------------------------------> */

            //Handle the end of a round (every character must have)
            const roundEndsSocket = socketIOClient(serverUrl + 'retrieve-round-ends')

            roundEndsSocket.on('RoundEnds', data => {
                console.log(data)
            })
        }
    }

    componentWillUnmount(){
        this._isMounted = false
    }

    render(){
        return(
            <>
                
            </>
        )
    }
}   

export default TheSavior