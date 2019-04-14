import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'

import "./Witch.css"
import serverUrl from '../../../../../serverUrl'

let target = '',
    protectId_buttons = [],
    killId_buttons = [],
    witchSocket,
    firstRoundSocket,
    calledTurnSocket,
    getPlayerSocket,
    getNextTurnSocket


class Witch extends Component{
    _isMounted = false

    state = {
        renderPlayers: null,
        renderLovers: null,
        renderCharmedPlayers: null,
        renderUI: null,
        endTurnConfirm: null,
        renderWitchAction: null,
        target: '',
        receiveTurn: false
    }

    KillPlayerBttn = (name, e) => {
        target = name

        if(window.confirm("Do you want to kill " + name + "?")){
            let sendingData = {
                roomid: this.props.roomid,
                target_kill: name
            }
            
            witchSocket.emit('RequestToKillPlayer', sendingData)

            this.setState({target})
        }
    }

    ProtectPlayerBttn = (name, e) => {
        target = name

        if(window.confirm("Do you want to save " + name + "?")){
            let sendingData = {
                roomid: this.props.roomid,
                target_protect: name
            }
    
            witchSocket.emit('RequestToProtectPlayer', sendingData)

            this.setState({target})
        }
    }

    endTurnBttn = () => {
        
        let sendingData = {
            roomid: this.props.roomid,
            role: 'Witch'
        }

        getNextTurnSocket.emit('RequestToGetNextTurn', sendingData)
        this.setState({endTurnConfirm: null})

    } 

    UIEndTurnBttn = (e) => {
        let sendingData = {
            roomid: this.props.roomid,
            role: 'Witch'
        }

        getNextTurnSocket.emit('RequestToGetNextTurn', sendingData)

        this.setState({renderWitchAction: <p>You chose to end turn.</p>})
        document.getElementById("cupid-layer1").classList.remove("in-game-cupid-layer-container-invisible")
        document.getElementById("cupid-layer2").classList.remove("in-game-cupid-layer-container-invisible")
        document.getElementById("cupid-layer1").classList.remove("in-game-cupid-layer-container-visible")
        document.getElementById("cupid-layer2").classList.remove("in-game-cupid-layer-container-visible")

        document.getElementById("cupid-layer1").classList.add("in-game-cupid-layer-container-invisible")
        document.getElementById("cupid-layer2").classList.add("in-game-cupid-layer-container-visible")
    }

    componentDidMount(){
        this._isMounted = true
        
        if(this._isMounted){
            protectId_buttons.length = 0
            killId_buttons.length = 0
            
            witchSocket = socketIOClient(serverUrl + 'witch')
            getNextTurnSocket = socketIOClient(serverUrl + 'retrieve-next-turn')

            /* <-----------------------------------------------> */

            //Handle the first round (every character must have)
            firstRoundSocket = socketIOClient(serverUrl + 'in-game')

            firstRoundSocket.on('connect', () => {
                firstRoundSocket.emit('JoinRoom', this.props.roomid)
            })

            //Retrieve the 1st turn, if the player is the first to be called, then render its ui 
            firstRoundSocket.on('Retrieve1stTurn', data => {
                if(data === this.props.username){
                    this.setState({
                        renderUI: <>
                                <p>Choose your target to kill and to protect?</p>
                                <button id="UI-end-turn-button" className="end-turn-witch-button" onClick={this.UIEndTurnBttn}>End turn</button>
                        </>,
                        receiveTurn: true
                    })
                }
            })

            /* <-----------------------------------------------> */

            //Handle the called turn (every character must have)
            calledTurnSocket = socketIOClient(serverUrl + 'retrieve-next-turn')

            calledTurnSocket.on('connect', () => {
                calledTurnSocket.emit('JoinRoom', this.props.roomid)
            })

            calledTurnSocket.on('getNextTurn', data => {
                if(data === this.props.username){
                    this.setState({
                        renderUI: <>
                            <p>Choose your target to kill and to protect?</p>
                            <button className="end-turn-witch-button" onClick={this.UIEndTurnBttn}>End turn</button>
                        </>,
                        receiveTurn: true
                    })
                }
            })
            
            //witch's action
            witchSocket.on('KillPlayer', (data) => {
                document.getElementById("cupid-layer1").classList.remove("in-game-cupid-layer-container-invisible")
                document.getElementById("cupid-layer2").classList.remove("in-game-cupid-layer-container-invisible")
                document.getElementById("cupid-layer1").classList.remove("in-game-cupid-layer-container-visible")
                document.getElementById("cupid-layer2").classList.remove("in-game-cupid-layer-container-visible")

                document.getElementById("cupid-layer1").classList.add("in-game-cupid-layer-container-invisible")
                document.getElementById("cupid-layer2").classList.add("in-game-cupid-layer-container-visible")

                if(data === 'ok'){
                    this.setState({
                        renderWitchAction: <p><b>{this.state.target}</b> Killed!</p>,
                        endTurnConfirm: <button type="button" onClick={this.endTurnBttn}>End turn</button>
                    })
                }

                else if(data === 'No Kill Potion Left'){
                    this.setState({
                        renderWitchAction: <p>No Kill Potion Left!</p>,
                        endTurnConfirm: <button type="button" onClick={this.endTurnBttn}>End turn</button>
                    })
                }
            })

            witchSocket.on('ProtectPlayer', (data) => {
                document.getElementById("cupid-layer1").classList.remove("in-game-cupid-layer-container-invisible")
                document.getElementById("cupid-layer2").classList.remove("in-game-cupid-layer-container-invisible")
                document.getElementById("cupid-layer1").classList.remove("in-game-cupid-layer-container-visible")
                document.getElementById("cupid-layer2").classList.remove("in-game-cupid-layer-container-visible")

                document.getElementById("cupid-layer1").classList.add("in-game-cupid-layer-container-invisible")
                document.getElementById("cupid-layer2").classList.add("in-game-cupid-layer-container-visible")

                if(data === 'ok'){
                    this.setState({
                        renderWitchAction: <p><b>{this.state.target}</b> Saved!</p>,
                        endTurnConfirm: <button type="button" onClick={this.endTurnBttn}>End turn</button>
                    })
                }

                else if(data === 'No Heal Potion Left'){
                    this.setState({
                        renderWitchAction: <p>No Heal Potion Left!</p>,
                        endTurnConfirm: <button type="button" onClick={this.endTurnBttn}>End turn</button>
                    })
                }
            })
        }
    }

    componentWillUnmount(){
        this._isMounted = false
        protectId_buttons.length = 0
        killId_buttons.length = 0

        witchSocket.disconnect()
        firstRoundSocket.disconnect()
        calledTurnSocket.disconnect()
        getPlayerSocket.disconnect()
        getNextTurnSocket.disconnect()
    }

    componentDidUpdate(prevProps, prevState){
        if(this.state.receiveTurn && this.state.receiveTurn !== prevState.receiveTurn){
            protectId_buttons.length = 0
            killId_buttons.length = 0
            
            // to display all the players that are from the room (every character must have)
            getPlayerSocket = socketIOClient(serverUrl + 'main-page')

            getPlayerSocket.on('connect', () => {
                getPlayerSocket.emit('JoinRoom', this.props.roomid)
                getPlayerSocket.emit('RequestToGetPlayers', this.props.roomid)
            })

            getPlayerSocket.on('GetPlayers', data => {
                const retrieveLeftAbilitiesSocket = socketIOClient(serverUrl + 'witch')

                retrieveLeftAbilitiesSocket.on('connect', () => {
                    retrieveLeftAbilitiesSocket.emit('RequestToRetrieveLeftAbilities', this.props.roomid)
                })

                retrieveLeftAbilitiesSocket.on('LeftAbilities', leftAbilities => {
                    this.setState({
                        renderPlayers: data.map((player, index) => {
                            let id = "witch_target_bttn_" + index,
                                killId = "witch_kill_bttn_" + index,
                                protectId = "witch_protect_bttn" + index
                            protectId_buttons.push(protectId)
                            killId_buttons.push(killId)
                            
                            return(
                                <div key = {player}>
                                    <p id={id}>{player}</p>
                                    <div>
                                        
                                        {!leftAbilities.useKill && (player !== this.props.username) ? <button id={killId} onClick={this.KillPlayerBttn.bind(this, player)}>Kill</button>: null}
                                        {!leftAbilities.useHeal ? <button id={protectId} onClick={this.ProtectPlayerBttn.bind(this, player)}>Protect</button> : null}
                                    </div>
                                </div>
                            )
                        })
                    })
                })
            })
        }
    }

    render(){
        return(
            <>
            <div className="in-game-cupid-layer1-container in-game-cupid-layer-container-visible" id="cupid-layer1">
                <div className="in-game-render-ui-container">
                    {this.state.renderUI}
                </div>
                
                <div className="in-game-render-players-container">
                    {this.state.renderPlayers}
                </div>

            </div>

            <div className="in-game-cupid-layer2-container in-game-cupid-layer-container-invisible" id="cupid-layer2">
                {this.state.renderWitchAction}
                {this.state.endTurnConfirm}
            </div>  
            </>
        )
    }
}   

export default Witch