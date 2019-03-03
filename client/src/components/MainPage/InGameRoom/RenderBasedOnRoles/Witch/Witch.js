import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'

import GetPlayers from '../../GetPlayers/GetPlayers'

const serverUrl = 'http://localhost:3001/'

let players = [],
    target = ''

class Witch extends Component{
    _isMounted = false

    state = {
        renderPlayers: null,
        renderLovers: null,
        renderCharmedPlayers: null,
        renderUI: null,
        endTurnConfirm: null
    }

    KillPlayerBttn = (name, e) => {
        target = name
        const socket = socketIOClient(serverUrl + 'witch')

        let sendingData = {
            roomid: this.props.roomid,
            target_kill: name
        }

        socket.emit('RequestToKillPlayer', sendingData)
    }

    ProtectPlayerBttn = (name, e) => {
        target = name

        const socket = socketIOClient(serverUrl + 'witch')

        let sendingData = {
            roomid: this.props.roomid,
            target_protect: name
        }

        socket.emit('RequestToProtectPlayer', sendingData)
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
                            let id = "witch_target_bttn_" + index,
                                killId = "witch_kill_bttn_" + index,
                                protectId = "witch_protect_bttn" + index
    
                            return(
                                <div key = {player}>
                                    <p id={id}>{player}</p>
                                    <button id={killId} onClick={this.KillPlayerBttn.bind(this, player)}>Kill</button>
                                    <button id={protectId} onClick={this.ProtectPlayerBttn.bind(this, player)}>Protect</button>
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
                                <p>Choose your target to kill and to protect?</p>
                            </div>
                        </>
                    })

                    //witch's action
                    const witchSocket = socketIOClient(serverUrl + 'witch')

                    witchSocket.on('KillPlayer', (data) => {
                        if(data === 'ok'){
                            alert('Killed ' + target + "!")
                            this.setState({
                                endTurnConfirm: <button type="button" onClick={this.endTurnBttn}>End turn</button>
                            })
                        }
                        
                    })

                    witchSocket.on('ProtectPlayer', (data) => {
                        if(data === 'ok'){
                            alert('Protected ' + target + "!")
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
                                <p>Choose your target to kill and to protect?</p>
                            </div>
                        </>
                    })
        
                    //witch's action
                    const witchSocket = socketIOClient(serverUrl + 'witch')
        
                    witchSocket.on('KillPlayer', (data) => {
                        if(data === 'ok'){
                            alert('Killed ' + target + "!")
                            this.setState({
                                endTurnConfirm: <button type="button" onClick={this.endTurnBttn}>End turn</button>
                            })
                        }
                    })

                    witchSocket.on('ProtectPlayer', (data) => {
                        if(data === 'ok'){
                            alert('Protected ' + target + "!")
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
        }
    }

    componentWillUnmount(){
        this._isMounted = false
    }

    render(){


        return(
            <>
                {this.state.renderUI}
                
                <br></br>

                {this.state.renderPlayers}

                <br></br>

                <br></br>

                <h3>List of Charmed Players: </h3>
                {this.state.renderCharmedPlayers}

                <br></br>

                {this.state.renderLovers}

                <br></br>

                {this.state.endTurnConfirm}

            </>
        )
    }
}   

export default Witch