import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'

import serverUrl from '../../../../../serverUrl'
import "./RoundEnd.css"

let setUpTime = 600, //10mins,
    chosenPlayer = "",
    timer,
    round_end_target_bttn_id_arr = []

let roundEndSocket, //round-end namespace
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

            round_end_target_bttn_id_arr.forEach(id => {
                document.getElementById(id).disabled = true
                document.getElementById(id).classList.remove('grayder-background')
                document.getElementById(id).classList.add('grayder-background')
            })
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
            round_end_target_bttn_id_arr.length = 0

            // to display all the players that are from the room (every character must have)
            roundEndSocket = socketIOClient(serverUrl + 'round-end')

            getPlayerSocket = socketIOClient(serverUrl + 'main-page')

            getPlayerSocket.on('connect', () => {
                getPlayerSocket.emit('JoinRoom', this.props.roomid)
                getPlayerSocket.emit('RequestToGetPlayers', this.props.roomid)
            })

            getPlayerSocket.on('GetPlayers', data => {
                round_end_target_bttn_id_arr.length = 0

                this.setState({
                    renderPlayers: data.map((player, index) => {
                        
                        let id = "round_end_target_bttn_" + player,
                        roundEndPlayerId = "round_end_" + player
                        
                        round_end_target_bttn_id_arr.push(id)

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
            

            roundEndSocket.on('connect', () => {
                roundEndSocket.emit('JoinRoom', this.props.roomid)
            })

            timer = setInterval(() => {
                if(setUpTime < 1){
                    this.setState({timerEnds: true})
                    clearInterval(timer)
                }
                else{
                    setUpTime -= 1
                    this.setState({renderUI: 
                        <>
                        <p>Timer: {Math.floor(setUpTime/60) +  ":" + Math.floor(setUpTime % 60) }</p>
                        <button id="vote-hanged-button" className="vote-hanged-button" onClick={this.VotePlayer}>Vote</button>
                        </>
                    })
                }
            }, 1000)

            // For players who arrive later, they will catch up with current voting
            roundEndSocket.emit('RequestToGetOtherChoices', this.props.roomid)

            roundEndSocket.on('OtherKillDecisions', data => {
                for(var key in data){
                    if(data.hasOwnProperty(key)){
                        if(document.getElementById("round_end_"+ key)){
                            document.getElementById("round_end_"+ key).innerText = data[key]
                        }
                    }
                }
            })

            roundEndSocket.on('GetOtherChoices', data => {
                if(document.getElementById("round_end_"+ data.player))
                    document.getElementById("round_end_"+ data.player).innerText = data.chosenPlayer
                
            })

            roundEndSocket.on('BroadcastREDeadPlayers', data => {
                clearInterval(timer)
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
        
        round_end_target_bttn_id_arr.length = 0

        roundEndSocket.disconnect()
        getPlayerSocket.disconnect()

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