import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'

import "./ThePiedPiper.css"

import serverUrl from '../../../../../serverUrl'

let piper_target_bttn_ids = [],
    playersToCharm = [],
    piperSocket,
    firstRoundSocket,
    getNextTurnSocket,
    calledTurnSocket,
    getCharmedSocket,
    getPlayerSocket,
    players = []


class ThePiedPiper extends Component{
    _isMounted = false

    state = {
        renderUI: null,
        renderPlayers: null,
        endTurnConfirm: null,
        renderLovers: null,
        renderCharmedPlayers: null,
        playersToCharm: [],
        receiveTurn: false
    }

    PlayersToCharm = (name, index, bttnId, e) => {
        if(window.confirm("Do you want to charm " + name + "?")){
            playersToCharm.push(name)

            document.getElementById(bttnId).disabled = true
            document.getElementById(bttnId).classList.remove("piper-choose-player-button-disable")
            document.getElementById(bttnId).classList.add("piper-choose-player-button-disable")

            if(players.length > 2){
                if(playersToCharm.length === 2){
                    this.setState({
                        playersToCharm: playersToCharm.map(player => {
                            return player
                        })
                    })
    
                    let sendingData = {
                        roomid: this.props.roomid,
                        playersToCharm: playersToCharm
                    }
    
                    piperSocket.emit('RequestToCharmPlayers', sendingData)
    
                    playersToCharm.length = 0
                }
            }

            else{
                this.setState({
                    playersToCharm: playersToCharm.map(player => {
                        return player
                    })
                })

                let sendingData = {
                    roomid: this.props.roomid,
                    playersToCharm: playersToCharm
                }

                piperSocket.emit('RequestToCharmPlayers', sendingData)

                playersToCharm.length = 0
            }
        }
    }

    endTurnBttn = () => {
        
        
        let sendingData = {
            roomid: this.props.roomid,
            role: 'The pied piper'
        }

        getNextTurnSocket.emit('RequestToGetNextTurn', sendingData)
        this.setState({endTurnConfirm: null})
    }  

    componentDidMount(){
        this._isMounted = true

        if(this._isMounted){
            playersToCharm.length = 0
            piper_target_bttn_ids.length = 0
            players.length = 0
            
            piperSocket = socketIOClient(serverUrl + 'piper')
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
                            <p>Please charm 2 people</p>
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
                            <p>Please charm 2 people</p>
                        </>,
                        receiveTurn: true
                    })
                }
            })

            //Piper's action
            piperSocket.on('CharmedPlayers', (data) => {
                document.getElementById("cupid-layer1").classList.remove("in-game-cupid-layer-container-invisible")
                document.getElementById("cupid-layer2").classList.remove("in-game-cupid-layer-container-invisible")
                document.getElementById("cupid-layer1").classList.remove("in-game-cupid-layer-container-visible")
                document.getElementById("cupid-layer2").classList.remove("in-game-cupid-layer-container-visible")

                document.getElementById("cupid-layer1").classList.add("in-game-cupid-layer-container-invisible")
                document.getElementById("cupid-layer2").classList.add("in-game-cupid-layer-container-visible")

                this.setState({
                    endTurnConfirm: <button type="button" onClick={this.endTurnBttn}>End turn</button>
                })
            })

            //Handle changes of the total charmed players via a socket event (every character must have)
            getCharmedSocket = socketIOClient(serverUrl + 'in-game')

            //Every socket is unique, meaning if a socket joined a room doesnt mean other sockets existing in the same page will join that room
            //Thus, we need to make every 'JoinRoom' emit event explicitly if we want that socket get response from a broadcast.
            getCharmedSocket.on('connect', () => {
                getCharmedSocket.emit('JoinRoom', this.props.roomid)
            })
            
            getCharmedSocket.emit('RequestToRetrieveCharmPlayers', this.props.roomid)

            getCharmedSocket.on('GetListOfCharmed', (data) => {
                data.forEach((player) => {
                    if(document.getElementById("piper_target_bttn_" + player)){
                        document.getElementById("piper_target_bttn_" + player).classList.remove("piper-choose-player-button-disable")
                        document.getElementById("piper_target_bttn_" + player).classList.add("piper-choose-player-button-disable")
                        document.getElementById("piper_target_bttn_" + player).disabled = true
                    }
                })
            })
        }
    }

    componentWillUnmount(){
        this._isMounted = false

        playersToCharm.length = 0
        piper_target_bttn_ids.length = 0
        players.length = 0

        piperSocket.disconnect()
        firstRoundSocket.disconnect()
        getNextTurnSocket.disconnect()
        calledTurnSocket.disconnect()
        getCharmedSocket.disconnect()
        getPlayerSocket.disconnect()
    }

    componentDidUpdate(prevProps, prevState){
        if(this.state.receiveTurn && this.state.receiveTurn !== prevState.receiveTurn){
            piper_target_bttn_ids.length = 0
            playersToCharm.length = 0
            players.length = 0

            // to display all the players that are from the room (every character must have)
            getPlayerSocket = socketIOClient(serverUrl + 'main-page')

            getPlayerSocket.on('connect', () => {
                getPlayerSocket.emit('RequestToGetPlayers', this.props.roomid)
            })

            getPlayerSocket.on('GetPlayers', data => {
                this.setState({
                    renderPlayers: data.map((player, index) => {
                        if(player !== this.props.username){
                            let id = "piper_target_bttn_" + player
    
                            piper_target_bttn_ids.push(id)
                            players.push(player)
    
                            return(
                                <button key = {player} id={id} type="button" onClick={this.PlayersToCharm.bind(this, player, index, id)}>{player}</button>
                            )
                        }
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
                <p>Charmed {this.state.playersToCharm.length === 2 ? <><b>{this.state.playersToCharm[0]}</b> and <b>{this.state.playersToCharm[1]}</b> </> : null}successfully!</p>
                {this.state.endTurnConfirm}
            </div> 
            </>
        )
    }
}   

export default ThePiedPiper