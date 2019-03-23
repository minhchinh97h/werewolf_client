import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'

import GetPlayers from '../../GetPlayers/GetPlayers'

const serverUrl = 'http://localhost:3001/'

let players = [],
    protectTarget = ''

const saviorSocket = socketIOClient(serverUrl + 'savior')

class TheSavior extends Component{
    _isMounted = false

    state = {
        isDead: false,
        isSilence: false
    }

    ProtectPlayer = (name, e) => {
        if(window.confirm("Do you want to protect " + name + "?")){
            protectTarget = name

            let sendingData = {
                roomid: this.props.roomid,
                protectTarget: protectTarget
            }

            saviorSocket.emit('RequestToProtectPlayer', sendingData)
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
        this._isMounted = true

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
                }
            })

            //Savior's action
            saviorSocket.on('ProtectedPlayer', (data) => {
                if(data === 'ok'){
                    alert(protectTarget + " is protected!")

                    this.setState({
                        endTurnConfirm: <button type="button" onClick={this.endTurnBttn}>End turn</button>
                    })
                }
            })

            /* <-----------------------------------------------> */

            //Handle lover (every character must have)
            const loverSocket = socketIOClient(serverUrl + 'in-game')

            //Every socket is unique, meaning if a socket joined a room doesnt mean other sockets existing in the same page will join that room
            //Thus, we need to make every 'JoinRoom' emit event explicitly if we want that socket get response from a broadcast.
            loverSocket.on('connect', () => {
                loverSocket.emit('JoinRoom', this.props.roomid)
            })

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
            const getCharmedSocket = socketIOClient(serverUrl + 'in-game')

            //Every socket is unique, meaning if a socket joined a room doesnt mean other sockets existing in the same page will join that room
            //Thus, we need to make every 'JoinRoom' emit event explicitly if we want that socket get response from a broadcast.
            getCharmedSocket.on('connect', () => {
                getCharmedSocket.emit('JoinRoom', this.props.roomid)
            })

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
            
            roundEndsSocket.emit('JoinRoom', this.props.roomid)

            roundEndsSocket.on('RoundEnds', data => {
                
                data.deaths.forEach((death, i) => {
                    if(this.props.username === death){
                        this.setState((prevState) => ({
                            isDead: !prevState.isDead
                        }))
                    }
                })

                if(data.silence === this.props.username)
                    this.setState((prevState) => ({
                        isSilence: !prevState.isSilence
                    }))
                
                //To do when the player is alive, use conditional statement in render method with this.state.isDead to update the UI if player is alive
                //1st: create a timer 
                //2nd: Use the similar UI layout for implementing the voting stage
                //3rd: after player confirms another player to execute, add a cancel button to re-choose (or not, just one confirmation button and an alert as Cupid's)
            })
        }
    }

    componentWillUnmount(){
        this._isMounted = false
    }

    componentDidUpdate(prevProps, prevState){
        if(this.state.isDead && this.state.isDead !== prevState.isDead){
            //To do when the player is dead
            //disable all buttons
            //display all the roles
            //faden the screen's color to gray
        }
    }

    render(){
        return(
            <>
                
            </>
        )
    }
}   

export default TheSavior