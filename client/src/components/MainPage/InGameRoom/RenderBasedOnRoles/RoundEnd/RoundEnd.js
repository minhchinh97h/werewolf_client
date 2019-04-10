import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'

import serverUrl from '../../../../../serverUrl'
import "./RoundEnd.css"

let setUpTime = 120000, //120s,
    chosenPlayer = "",
    timer

let ownChoiceHangedPlayer, //round-end namespace
    endRoundSocket,
    roundEndSocket,
    getPlayerSocket 

export default class RoundEnd extends Component{
    _isMounted = false

    state = {
        renderUI: null,
        renderPlayers: null,
        renderChosenExecutedPlayer: null,
        renderFinalExecutedPlayer: null,
        endRoundConfirm: null,
        timerEnds: false
    }

    VotePlayer = () => {
        if(window.confirm("Hang " + chosenPlayer + "?")){
            let sendingData = {
                chosenPlayer: chosenPlayer,
                roomid: this.props.roomid,
                player: this.props.username
            }

            roundEndSocket.emit("RequestToHangPlayer", sendingData)

            this.setState({renderChosenExecutedPlayer: <p>Your Choice: <b>{chosenPlayer}</b></p>})

            document.getElementById("vote-hanged-button").style.display = "none"
        }
    }

    ChoosePlayer = (name, e) => {
        chosenPlayer = name

        let sendingData = {
            chosenPlayer: chosenPlayer,
            player: this.props.username,
            roomid: this.props.roomid
        }

        roundEndSocket.emit("BroadCastMyChoice", sendingData)
    }

    EndRound = () => {

        let sendingData = {
            roomid: this.props.roomid,
            player: this.props.username
        }

        roundEndSocket.emit('RequestToEndRound', sendingData)

        this.setState({endRoundConfirm: null})

    }

    componentDidMount(){
        this._isMounted = true

        if(this._isMounted){
            // to display all the players that are from the room (every character must have)
            // ownChoiceHangedPlayer = socketIOClient(serverUrl + 'round-end')
            // endRoundSocket = socketIOClient(serverUrl + 'round-end')
            roundEndSocket = socketIOClient(serverUrl + 'round-end')

            getPlayerSocket = socketIOClient(serverUrl + 'main-page')

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
                                {player === this.props.username ?
                                    <button className="grayder-background" id={id} type="button" onClick={this.ChoosePlayer.bind(this, player)} disabled>{player}</button>
                                    :
                                    <button  id={id} type="button" onClick={this.ChoosePlayer.bind(this, player)}>{player}</button>
                                }
                                <div id={roundEndPlayerId} className="in-game-render-players-container-werewolve-chosen"></div>
                            </div>
                        )
                    })
                })
            })
            
            let passedTime = new Date().getTime() - this.props.startTime
            let actualTime = setUpTime - passedTime


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
                if(document.getElementById("round_end_"+ data.player))
                    document.getElementById("round_end_"+ data.player).innerText = data.chosenPlayer
                
            })

            roundEndSocket.on('BroadcastREDeadPlayers', data => {
                clearInterval(timer)
                console.log(data)
                if(document.getElementById("cupid-layer1") && document.getElementById("cupid-layer2")){
                    document.getElementById("cupid-layer1").classList.remove("in-game-cupid-layer-container-invisible")
                    document.getElementById("cupid-layer2").classList.remove("in-game-cupid-layer-container-invisible")
                    document.getElementById("cupid-layer1").classList.remove("in-game-cupid-layer-container-visible")
                    document.getElementById("cupid-layer2").classList.remove("in-game-cupid-layer-container-visible")

                    document.getElementById("cupid-layer1").classList.add("in-game-cupid-layer-container-invisible")
                    document.getElementById("cupid-layer2").classList.add("in-game-cupid-layer-container-visible")

                    let playersGetHang = ""

                    data.forEach((player) => playersGetHang += player + " ")

                    this.setState({
                        renderFinalExecutedPlayer: <div><p>Final Executed: <strong>{playersGetHang}</strong></p></div>,
                        endRoundConfirm: <button className="end-round-confirm-button" onClick={this.EndRound}>End Round</button>
                    })
                }
            })
        }
    }

    componentDidUpdate(prevProps, prevState){
        if(this.state.renderPlayers !== prevState.renderPlayers){
            // document.getElementById("round_end_target_bttn_" + this.props.username).disabled = true
            // document.getElementById("round_end_target_bttn_" + this.props.username).classList.remove("grayder-background")
            // document.getElementById("round_end_target_bttn_" + this.props.username).classList.add("grayder-background")
        }

        if(this.state.timerEnds !== prevState.timerEnds && this.state.timerEnds){
            let sendingData = {
                chosenPlayer: this.props.username,
                roomid: this.props.roomid,
                player: this.props.username
            }

            roundEndSocket.emit("RequestToHangPlayer", sendingData)
        }
    }

    componentWillUnmount(){
        this._isMounted = false
        
        // ownChoiceHangedPlayer.disconnect()
        roundEndSocket.disconnect()
        // endRoundSocket.disconnect()
        getPlayerSocket.disconnect()

        console.log("round end unmount")

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