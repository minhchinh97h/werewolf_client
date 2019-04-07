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
        timerEnds: false
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

            document.getElementById("vote-hanged-button").style.display = "none"
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

    EndRound = () => {
        const socket = socketIOClient(serverUrl + 'round-end')

        let sendingData = {
            roomid: this.props.roomid,
            player: this.props.player
        }

        socket.emit('RequestToEndRound', sendingData)
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

            const roundEndSocket = socketIOClient(serverUrl + 'round-end')

            roundEndSocket.on('connect', () => {
                roundEndSocket.emit('JoinRoom', this.props.roomid)
            })

            timer = setInterval(() => {
                if(actualTime < 1){
                    this.setState({timerEnds: true})
                    clearInterval(timer)
                }
                else{
                    actualTime -= 1000
                    this.setState({renderUI: 
                        <>
                        <p>Timer: {Math.floor(actualTime/1000)}</p>
                        <button id="vote-hanged-button" className="vote-hanged-button" onClick={this.VotePlayer}>Vote</button>
                        </>
                    })
                }
            }, 1000)

            roundEndSocket.on('GetOtherChoices', data => {
                document.getElementById("round_end_"+ data.player).innerText = data.chosenPlayer
                
            })

            roundEndSocket.on('BroadcastREDeadPlayers', data => {
                console.log(data)
                document.getElementById("cupid-layer1").classList.remove("in-game-cupid-layer-container-invisible")
                document.getElementById("cupid-layer2").classList.remove("in-game-cupid-layer-container-invisible")
                document.getElementById("cupid-layer1").classList.remove("in-game-cupid-layer-container-visible")
                document.getElementById("cupid-layer2").classList.remove("in-game-cupid-layer-container-visible")

                document.getElementById("cupid-layer1").classList.add("in-game-cupid-layer-container-invisible")
                document.getElementById("cupid-layer2").classList.add("in-game-cupid-layer-container-visible")

                let playersGetHang = ""

                data.forEach((player) => playersGetHang += player + "")

                this.setState({
                    renderFinalExecutedPlayer: <div><p>Final Executed: <strong>{playersGetHang}</strong></p></div>,
                    endRoundConfirm: <button className="end-round-confirm-button" onClick={this.EndRound}>End Round</button>
                })
            })

            // ownChoiceHangedPlayer.on('ConfirmHangedPlayer', data => {
            //     if(data === 'ok'){
            //         document.getElementById("cupid-layer1").classList.remove("in-game-cupid-layer-container-invisible")
            //         document.getElementById("cupid-layer2").classList.remove("in-game-cupid-layer-container-invisible")
            //         document.getElementById("cupid-layer1").classList.remove("in-game-cupid-layer-container-visible")
            //         document.getElementById("cupid-layer2").classList.remove("in-game-cupid-layer-container-visible")

            //         document.getElementById("cupid-layer1").classList.add("in-game-cupid-layer-container-invisible")
            //         document.getElementById("cupid-layer2").classList.add("in-game-cupid-layer-container-visible")
            //     }
            // })
        }
    }

    componentDidUpdate(prevProps, prevState){
        if(this.state.renderPlayers !== prevState.renderPlayers){
            document.getElementById("round_end_target_bttn_" + this.props.username).disabled = true
            document.getElementById("round_end_target_bttn_" + this.props.username).classList.remove("grayder-background")
            document.getElementById("round_end_target_bttn_" + this.props.username).classList.add("grayder-background")
        }

        if(this.state.timerEnds !== prevState.timerEnds && this.state.timerEnds){
            let sendingData = {
                chosenPlayer: this.props.username,
                roomid: this.props.roomid,
                player: this.props.username
            }

            ownChoiceHangedPlayer.emit("RequestToHangPlayer", sendingData)
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
                </div>
                
                <div className="in-game-render-players-container">
                    {this.state.renderPlayers}
                </div>

            </div>

            <div className="in-game-cupid-layer2-container in-game-cupid-layer-container-invisible" id="cupid-layer2">
                {this.state.renderChosenExecutedPlayer}
                {this.state.renderFinalExecutedPlayer}
                {this.state.endRoundConfirm}
            </div> 
            </>
        )
    }
}