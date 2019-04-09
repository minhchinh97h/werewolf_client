import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'

import serverUrl from '../../../../../serverUrl'

import "./Werewolves.css"

let otherWolves = [],
    targetChoice = '',
    werewolvesIconId_arr = []

let otherSocket

const ownChoiceConfirmKill = socketIOClient(serverUrl + 'werewolves')
        


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
        receiveTurn: false
    }

    chooseTargetBttn = (name, e) => {
        targetChoice = name
        const socket = socketIOClient(serverUrl + 'werewolves')

        let sendingData = {
            choseTarget: name,
            wolfName: this.props.username,
            roomid: this.props.roomid
        }

        socket.emit("RequestMyChoice", sendingData)

        this.setState({choseTarget: <p>{targetChoice}</p>})
    }

    AgreeOnKill = (e) => {
        if(window.confirm("Kill " + targetChoice + "?")){
            let sendingData = {
                choseTarget: targetChoice,
                roomid: this.props.roomid
            }

            ownChoiceConfirmKill.emit("RequestToAgreeKill", sendingData)
            this.setState({renderOwnTarget: <div><p>Your choice: <strong>{targetChoice}</strong></p></div>})
        }
    }

    endTurnBttn = () => {
        const socket = socketIOClient(serverUrl + 'retrieve-next-turn')
        
        let sendingData = {
            roomid: this.props.roomid,
            role: 'Werewolves',
            player: this.props.username
        }

        socket.emit('RequestToGetNextTurn', sendingData)

        this.setState({endTurnConfirm: null})

        this.setState({receiveTurn: false})
    }  

    componentDidMount(){
        this._isMounted = true

        if(this._isMounted){

            

            /* <-----------------------------------------------> */

            //Handle the first round (every character must have)
            const firstRoundSocket = socketIOClient(serverUrl + 'in-game')

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
            const calledTurnSocket = socketIOClient(serverUrl + 'retrieve-next-turn')

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
            
            //confirmation
            ownChoiceConfirmKill.on('ConfirmKillRespond', data => {
                if(data === "ok"){
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
                        endTurnConfirm: <button type="button" onClick={this.endTurnBttn}>End turn</button>
                    })
                }
            })

            
        }
    }

    componentWillUnmount(){
        this._isMounted = false

        
    }

    componentDidUpdate(prevProps, prevState){
        if(this.state.receiveTurn !== prevState.receiveTurn && this.state.receiveTurn){
            // to display all the players that are from the room (every character must have)
            const getPlayerSocket = socketIOClient(serverUrl + 'main-page')

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
                        renderFinalTarget: <div><p>Final Target is: <strong>{data}</strong></p></div>
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
                {this.state.renderOwnTarget}
                {this.state.renderFinalTarget}
                {this.state.endTurnConfirm}
            </div> 
            </>
        )
    }
}   

export default Werewolves