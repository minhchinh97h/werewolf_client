import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'

import serverUrl from '../../../../../serverUrl'

import './TheFox.css'

let the_fox_target_bttn_ids = [],
    players = [],
    playersToReveal_arr = [],
    foxSocket,
    getNextTurnSocket,
    firstRoundSocket,
    calledTurnSocket,
    getPlayerSocket
  
class TheFox extends Component{
    _isMounted = false

    state = {
        renderUI: null,
        renderPlayers: null,
        renderTargetRole: null,
        endTurnConfirm: null,
        renderLovers: null,
        renderCharmedPlayers: null,
        receiveTurn: false
    }

    playersToRevealBttn = (name, index, e) => {
        if(window.confirm("Do you want to scent " + name + "?")){
            playersToReveal_arr.push(name)

            if(playersToReveal_arr.length === 3){
                let sendingData = {
                    roomid: this.props.roomid,
                    players: playersToReveal_arr
                }

                foxSocket.emit('RequestToScent', sendingData)

                the_fox_target_bttn_ids.forEach((bttnId, index) => {
                    document.getElementById(bttnId).disabled = true
                })
            }
           
            if(document.getElementById("the_fox_target_bttn_" + name)){
                document.getElementById("the_fox_target_bttn_" + name).classList.remove("grayder-background")
                document.getElementById("the_fox_target_bttn_" + name).classList.add("grayder-background")
            }

        }
    }

    endTurnBttn = () => {
        let sendingData = {
            roomid: this.props.roomid,
            role: 'The fox'
        }

        getNextTurnSocket.emit('RequestToGetNextTurn', sendingData)
        this.setState({endTurnConfirm: null})
    }   

    componentDidMount(){
        this._isMounted = true

        if(this._isMounted){

            the_fox_target_bttn_ids.length = 0
            playersToReveal_arr.length = 0

            foxSocket = socketIOClient(serverUrl + 'the-fox')
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
                    //render UI
                    this.setState({
                        renderUI: <>
                            <p>Choose 3 players to scent?</p>
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
                    //render UI
                    this.setState({
                        renderUI: <>
                            <p>Choose 3 players to scent?</p>
                        </>,
                        receiveTurn: true
                    })
                }
            })

            //The Fox's action
            foxSocket.emit('GetCanUseAbility', this.props.roomid)

            foxSocket.on('CanUseAbility', data => {
                //if the fox loses the ability
                if(!data){
                    document.getElementById("cupid-layer1").classList.remove("in-game-cupid-layer-container-invisible")
                    document.getElementById("cupid-layer2").classList.remove("in-game-cupid-layer-container-invisible")
                    document.getElementById("cupid-layer1").classList.remove("in-game-cupid-layer-container-visible")
                    document.getElementById("cupid-layer2").classList.remove("in-game-cupid-layer-container-visible")

                    document.getElementById("cupid-layer1").classList.add("in-game-cupid-layer-container-invisible")
                    document.getElementById("cupid-layer2").classList.add("in-game-cupid-layer-container-visible")

                    this.setState({
                        renderTargetRole: <p>You lost your ability!</p>,
                        endTurnConfirm: <button type="button" onClick={this.endTurnBttn}>End turn</button>
                    })
                }
            })

            foxSocket.on('GetScentPlayers', (data) => {
                document.getElementById("cupid-layer1").classList.remove("in-game-cupid-layer-container-invisible")
                document.getElementById("cupid-layer2").classList.remove("in-game-cupid-layer-container-invisible")
                document.getElementById("cupid-layer1").classList.remove("in-game-cupid-layer-container-visible")
                document.getElementById("cupid-layer2").classList.remove("in-game-cupid-layer-container-visible")

                document.getElementById("cupid-layer1").classList.add("in-game-cupid-layer-container-invisible")
                document.getElementById("cupid-layer2").classList.add("in-game-cupid-layer-container-visible")

                this.setState({
                    renderTargetRole: <p>Werewolves among <b>{playersToReveal_arr[0]}</b>, <b>{playersToReveal_arr[1]}</b>, <b>{playersToReveal_arr[2]}</b>? <b>{data ? "YES" : "NO"}</b></p>,
                    endTurnConfirm: <button type="button" onClick={this.endTurnBttn}>End turn</button>
                })
            })
        }
    }

    componentWillUnmount(){
        this._isMounted = false
        the_fox_target_bttn_ids.length = 0
        playersToReveal_arr.length = 0

        foxSocket.disconnect()
        getNextTurnSocket.disconnect()
        firstRoundSocket.disconnect()
        calledTurnSocket.disconnect()
        getPlayerSocket.disconnect()
    }

    componentDidUpdate(prevProps, prevState){
        if(this.state.receiveTurn && this.state.receiveTurn !== prevState.receiveTurn){
            the_fox_target_bttn_ids.length = 0

            // to display all the players that are from the room (every character must have)
            getPlayerSocket = socketIOClient(serverUrl + 'main-page')

            getPlayerSocket.on('connect', () => {
                getPlayerSocket.emit('JoinRoom', this.props.roomid)
                getPlayerSocket.emit('RequestToGetPlayers', this.props.roomid)
            })

            getPlayerSocket.on('GetPlayers', data => {
                players = []

                this.setState({
                    renderPlayers: data.map((player, index) => {
                        if(player !== this.props.username){
                            players.push(player)
                            let id = "the_fox_target_bttn_" + player
    
                            the_fox_target_bttn_ids.push(id)
    
                            return(
                                <button key = {player} id={id} type="button" onClick={this.playersToRevealBttn.bind(this, player, index)}>{player}</button>
                            )
                        }

                        return ''
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
                {this.state.renderTargetRole}
                {this.state.endTurnConfirm}
            </div>  
            </>
        )
    }
}   

export default TheFox