import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'

import serverUrl from '../../../../../serverUrl'

import "./Werewolves.css"

let otherWolves = [],
    targetChoice = '',
    werewolvesIconId_arr = [],
    falseRole_arr = []

let otherSocket,
    getPlayerSocket,
    firstRoundSocket,
    calledTurnSocket,
    ownChoiceConfirmKill, //werewolves namespace
    getNextTurnSocket

class Werewolves extends Component{
    _isMounted = false

    state = {
        renderUI: null,
        renderPlayers: null,
        renderLovers: null,
        endTurnConfirm: null,
        renderOtherChoices: null,
        choseTarget: null,
        renderCharmedPlayers: null,
        renderFinalTarget: null,
        renderOwnTarget: null,
        receiveTurn: false,
        renderFalsePickingPhase: null,
        didChooseFalseRole: false
    }

    chooseTargetBttn = (name, e) => {
        targetChoice = name

        let sendingData = {
            choseTarget: name,
            wolfName: this.props.username,
            roomid: this.props.roomid
        }

        ownChoiceConfirmKill.emit("RequestMyChoice", sendingData)

        this.setState({choseTarget: <p>{targetChoice}</p>})
    }

    AgreeOnKill = (e) => {
        if(window.confirm("Kill " + targetChoice + "?")){
            let sendingData = {
                choseTarget: targetChoice,
                roomid: this.props.roomid
            }

            ownChoiceConfirmKill.emit("RequestToAgreeKill", sendingData)
            this.setState({renderOwnTarget: <span>Your choice: <strong>{targetChoice}</strong>, </span>})
        }
    }

    chooseFalseRole = (falseRole, e) => {
        if(window.confirm("choose false role: " + falseRole + "?")){
            let sendingData = {
                falseRole: falseRole,
                wolfName: this.props.username,
                roomid: this.props.roomid
            }
    
            otherSocket.emit("RequestFalseRoleChoice", sendingData)

            falseRole_arr.forEach((falseRole) => {
                document.getElementById("false_role_bttn_" + falseRole).disabled = true
                document.getElementById("false_role_bttn_" + falseRole).classList.remove("grayder-background")
                document.getElementById("false_role_bttn_" + falseRole).classList.add("grayder-background")
            })
        }
    }

    endTurnBttn = () => {
        let sendingData = {
            roomid: this.props.roomid,
            role: 'Werewolves',
            player: this.props.username
        }

        getNextTurnSocket.emit('RequestToGetNextTurn', sendingData)

        this.setState({endTurnConfirm: null})

        this.setState({receiveTurn: false})
    }  

    componentDidMount(){
        this._isMounted = true

        if(this._isMounted){
            getNextTurnSocket = socketIOClient(serverUrl + 'retrieve-next-turn')

            /* <-----------------------------------------------> */

            //Handle the first round (every character must have)
            firstRoundSocket = socketIOClient(serverUrl + 'in-game')

            firstRoundSocket.on('connect', () => {
                firstRoundSocket.emit('JoinRoom', this.props.roomid)
            })

            //Retrieve the 1st turn, if the player is the first to be called, then render its ui 
            firstRoundSocket.on('Retrieve1stTurn', data => {
                
                if(data instanceof Array){
                    data.every(player => {
                        if(player === this.props.username){
                            this.setState({receiveTurn: true})
                            //render UI
                            this.setState({
                                renderUI: <>
                                        <p>Who do you want to kill?</p>
                                        <button className="agree-on-kill-button" onClick={this.AgreeOnKill} id="agree-on-kill-button">Agree on Kill</button>
                                </>
                            })
                            return false
                        }

                        return true
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
                if(data instanceof Array){
                    data.every(player => {
                        if(player === this.props.username){
                            this.setState({receiveTurn: true})
                            //render UI
                            this.setState({
                                renderUI: <>
                                        <p>Who do you want to kill?</p>
                                        <button className="agree-on-kill-button" onClick={this.AgreeOnKill} id="agree-on-kill-button">Agree on Kill</button>
                                </>
                            })
                            return false
                        }

                        return true
                    })
                }
                
            })

            /* <-----------------------------------------------> */
            ownChoiceConfirmKill = socketIOClient(serverUrl + 'werewolves')

            //confirmation
            ownChoiceConfirmKill.on('ConfirmKillRespond', data => {
                if(data === "ok"){
                    let sendingData = {
                        roomid: this.props.roomid,
                        numberOfWerewolves: otherWolves.length + 1
                    }
                    otherSocket.emit('GetFalseRoles', sendingData)

                    otherSocket.on('FalseRoles', data => {
                        falseRole_arr.length = 0

                        this.setState({ 
                            renderFalsePickingPhase: data.map((falseRole, index) => {
                                let bttnId = "false_role_bttn_" + falseRole,
                                    werewolvesId = "false_role_werewolf_" + falseRole

                                falseRole_arr.push(falseRole)

                                return(
                                    <div key={falseRole} className="in-game-render-players-container-werewolve">
                                        <button id={bttnId} onClick={this.chooseFalseRole.bind(this, falseRole)}>{falseRole}</button>
                                        <div id={werewolvesId} className="in-game-render-players-container-werewolve-chosen"></div>
                                    </div>
                                )
                            })
                        })
                    })

                    otherSocket.on('FalseRoleChoice', data => {
                        document.getElementById("false_role_bttn_" + data.falseRole).disabled = true
                        document.getElementById("false_role_bttn_" + data.falseRole).classList.remove("grayder-background")
                        document.getElementById("false_role_bttn_" + data.falseRole).classList.add("grayder-background")

                        document.getElementById("false_role_werewolf_" + data.falseRole).innerText = data.wolfName
                    })
                    document.getElementById("cupid-layer1").classList.remove("in-game-cupid-layer-container-invisible")
                    document.getElementById("cupid-layer2").classList.remove("in-game-cupid-layer-container-invisible")
                    document.getElementById("cupid-layer1").classList.remove("in-game-cupid-layer-container-visible")
                    document.getElementById("cupid-layer2").classList.remove("in-game-cupid-layer-container-visible")

                    document.getElementById("cupid-layer1").classList.add("in-game-cupid-layer-container-invisible")
                    document.getElementById("cupid-layer2").classList.add("in-game-cupid-layer-container-visible")

                    document.getElementById("agree-on-kill-button").disabled = true
                    document.getElementById("agree-on-kill-button").classList.remove("grayder-background")
                    document.getElementById("agree-on-kill-button").classList.add("grayder-background")

                    this.setState({
                        endTurnConfirm: <button className="werewolves-end-turn-button" type="button" onClick={this.endTurnBttn}>End turn</button>
                    })
                }
            })

            
        }
    }

    componentWillUnmount(){
        this._isMounted = false

        otherSocket.disconnect()
        getPlayerSocket.disconnect()
        firstRoundSocket.disconnect()
        calledTurnSocket.disconnect()
        ownChoiceConfirmKill.disconnect()
        getNextTurnSocket.disconnect()
    }

    componentDidUpdate(prevProps, prevState){
        if(this.state.receiveTurn !== prevState.receiveTurn && this.state.receiveTurn){
            // to display all the players that are from the room (every character must have)
            getPlayerSocket = socketIOClient(serverUrl + 'main-page')

            getPlayerSocket.on('connect', () => {
                getPlayerSocket.emit('RequestToGetPlayers', this.props.roomid)
            })

            getPlayerSocket.on('GetPlayers', data => {
                this.setState({
                    renderPlayers: data.map((player, index) => {
                        let id = "werewolves_target_bttn_" + player,
                            werewolvesIconId = "werewolves_icon_" + player
                        
                        return(
                            <div key = {player} className="in-game-render-players-container-werewolve">
                                <button  id={id} type="button" onClick={this.chooseTargetBttn.bind(this, player)}>{player}</button>
                                <div id={werewolvesIconId} className="in-game-render-players-container-werewolve-chosen"></div>
                            </div>
                        )
                    })
                })

                //Handle other werewolves choices && confirmation that the kill target is saved into database && final target
                otherSocket = socketIOClient(serverUrl + 'werewolves')

                //Join room for the werewolves namespace
                otherSocket.on('connect', () => {
                    otherSocket.emit('JoinRoom', this.props.roomid)
                })

                //Request to get other werewolves in this specific socket
                otherSocket.emit('RequestToGetOtherWerewolves', this.props.roomid)

                otherSocket.on('GetOtherWerewolves', data => {
                    data.forEach((player) => {
                        if(document.getElementById("werewolves_target_bttn_" + player)){
                            let wolfNode = document.getElementById("werewolves_target_bttn_" + player)
                            wolfNode.innerText += " (Wolf)"
                            wolfNode.classList.remove("grayder-background")
                            wolfNode.classList.add("grayder-background")
                            wolfNode.disabled = true
                        }
                    })
                })

                //others choices
                otherSocket.on('OtherChoices', (data) => {
                    //to advoid duplication
                    let isContainWolfName = false

                    otherWolves.forEach((wolf, index) => {
                        if(wolf.wolfName === data.wolfName){
                            wolf.choseTarget = data.choseTarget
                            isContainWolfName = true
                        }
                    })

                    if(!isContainWolfName){
                        otherWolves.push(data)
                    }

                    otherWolves.forEach((choice) => {
                        if(document.getElementById("werewolves_icon_"+ choice.wolfName))
                        document.getElementById("werewolves_icon_"+ choice.wolfName).innerText = choice.choseTarget
                    })
                })
                
                //Final target
                otherSocket.on('ReceiveTheFinalTarget', data => {
                    this.setState({
                        renderFinalTarget: <span>Final Target is: <strong>{data}</strong> - </span>
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
                <div className="werewolves-announce-holder">
                    {this.state.renderOwnTarget}
                    {this.state.renderFinalTarget}
                    {this.state.endTurnConfirm}
                </div>
                
                <div className="werewolves-false-phase-holder">
                    {this.state.renderFalsePickingPhase}
                </div>
            </div> 
            </>
        )
    }
}   

export default Werewolves