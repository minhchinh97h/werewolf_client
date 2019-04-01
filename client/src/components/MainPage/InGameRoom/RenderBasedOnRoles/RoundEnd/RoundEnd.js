import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'

import serverUrl from '../../../../../serverUrl'
import "./RoundEnd.css"

let setUpTime = 10000, //10s,
    chosenPlayer = "",
    timer

const ownChoiceHangedPlayer = socketIOClient(serverUrl + 'round-end')

export default class RoundEnd extends Component{
    _isMounted = false

    state = {
        renderUI: null,
        renderPlayers: null,
        renderChosenExecutedPlayer: null,
        renderFinalExecutedPlayer: null,
    }

    VotePlayer = () => {
        if(window.confirm("Hang " + chosenPlayer + "?")){
            let sendingData = {
                chosenPlayer: chosenPlayer,
                roomid: this.props.roomid,
                player: this.props.username
            }

            ownChoiceHangedPlayer.emit("RequestToHangPlayer", sendingData)

            this.setState({renderChosenExecutedPlayer: <p>Your Choice: <b>{chosenPlayer}</b></p>})
        }
    }

    ChoosePlayer = (name, e) => {
        chosenPlayer = name

        const socket = socketIOClient(serverUrl + 'round-end')

        let sendingData = {
            chosenPlayer: chosenPlayer,
            player: this.props.username,
            roomid: this.props.roomid
        }

        socket.emit("BroadCastMyChoice", sendingData)
    }

    componentDidMount(){
        this._isMounted = true

        if(this._isMounted){
            // to display all the players that are from the room (every character must have)
            const getPlayerSocket = socketIOClient(serverUrl + 'main-page')

            getPlayerSocket.on('connect', () => {
                getPlayerSocket.emit('RequestToGetPlayers', this.props.roomid)
            })

            getPlayerSocket.on('GetPlayers', data => {
                this.setState({
                    renderPlayers: data.map((player, index) => {
                        let id = "round_end_target_bttn_" + player,
                            roundEndPlayerId = "round_end_" + player
                        
                        return(
                            <div key = {player} className="in-game-render-players-container-werewolve">
                                <button  id={id} type="button" onClick={this.ChoosePlayer.bind(this, player)}>{player}</button>
                                <div id={roundEndPlayerId} className="in-game-render-players-container-werewolve-chosen"></div>
                            </div>
                        )
                    })
                })
            })
            
            let passedTime = new Date().getTime() - this.props.startTime
            let actualTime = setUpTime - passedTime

            timer = setInterval(() => {
                if(actualTime === 0){

                }
                else{
                    actualTime -= 1000
                    this.setState({renderUI: <p>{Math.floor(actualTime/1000)}</p>})
                }
            }, 1000)

            const roundEndSocket = socketIOClient(serverUrl + 'round-end')

            roundEndSocket.on('connect', () => {
                roundEndSocket.emit('JoinRoom', this.props.roomid)
            })

            roundEndSocket.on('GetOtherChoices', data => {
                data.forEach((choice) => {
                    document.getElementById("round_end_"+ choice.player).innerText = choice.chosenPlayer
                })
            })

            roundEndSocket.on('BroadcastREDeadPlayers', data => {
                this.setState({
                    renderFinalExecutedPlayer: data.map((player) => {
                        return(
                            <div><p>Final Executed: <strong>{data}</strong></p></div>
                        )
                    })
                })
            })

            ownChoiceHangedPlayer.on('ConfirmHangedPlayer', data => {
                if(data === 'ok'){
                    document.getElementById("cupid-layer1").classList.remove("in-game-cupid-layer-container-invisible")
                    document.getElementById("cupid-layer2").classList.remove("in-game-cupid-layer-container-invisible")
                    document.getElementById("cupid-layer1").classList.remove("in-game-cupid-layer-container-visible")
                    document.getElementById("cupid-layer2").classList.remove("in-game-cupid-layer-container-visible")

                    document.getElementById("cupid-layer1").classList.add("in-game-cupid-layer-container-invisible")
                    document.getElementById("cupid-layer2").classList.add("in-game-cupid-layer-container-visible")

                    document.getElementById("agree-on-kill-button").disabled = true
                    document.getElementById("agree-on-kill-button").classList.remove("grayder-background")
                    document.getElementById("agree-on-kill-button").classList.add("grayder-background")
                }
            })
        }
    }

    componentWillUnmount(){
        this._isMounted = false

        clearInterval(timer)
    }

    render(){
        return(
            <>  
            <div className="in-game-cupid-layer1-container in-game-cupid-layer-container-visible" id="cupid-layer1">
                    
                <div className="in-game-render-ui-container">
                    {this.state.renderUI}
                    <button onClick={this.VotePlayer}>

                    </button>
                </div>
                
                <div className="in-game-render-players-container">
                    {this.state.renderPlayers}
                </div>

            </div>

            <div className="in-game-cupid-layer2-container in-game-cupid-layer-container-invisible" id="cupid-layer2">
                {this.state.renderChosenExecutedPlayer}
                {this.state.renderFinalExecutedPlayer}
                {this.state.renderExecutedPlayer}
            </div> 
            </>
        )
    }
}