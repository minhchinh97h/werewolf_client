import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'

import serverUrl from '../../../../../serverUrl'

let the_fox_target_bttn_ids = [],
    players = [],
    target 

const foxSocket = socketIOClient(serverUrl + 'the-fox')
        
class TheFox extends Component{
    _isMounted = false

    state = {
        renderUI: null,
        renderPlayers: null,
        renderTargetRole: null,
        endTurnConfirm: null,
        renderLovers: null,
        renderCharmedPlayers: null
    }

    playersToRevealBttn = (name, index, e) => {
        target = name
        let chosenPlayers = []

        chosenPlayers.push(name)

        if(index -1 >= 0){
            chosenPlayers.push(players[index - 1])
        }

        if(index + 1 < players.length){
            chosenPlayers.push(players[index + 1])
        }

        let sendingData = {
            roomid: this.props.roomid,
            players: chosenPlayers
        }

        if(window.confirm("Do you want to scent " + name + " and the two adjacent neighbors?")){
            foxSocket.emit('RequestToScent', sendingData)

            the_fox_target_bttn_ids.forEach((bttnId, index) => {
                document.getElementById(bttnId).disabled = true
            })
        }
    }

    endTurnBttn = () => {
        const socket = socketIOClient(serverUrl + 'retrieve-next-turn')
        
        let sendingData = {
            roomid: this.props.roomid,
            role: 'The fox'
        }

        socket.emit('RequestToGetNextTurn', sendingData)
        this.setState({endTurnConfirm: null})
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
                players = []

                this.setState({
                    renderPlayers: data.map((player, index) => {
                        if(player !== this.props.username){
                            players.push(player)
                            let id = "the_fox_target_bttn_" + index
    
                            the_fox_target_bttn_ids.push(id)
    
                            return(
                                <button key = {player} id={id} type="button" onClick={this.playersToRevealBttn.bind(this, player, index)}>{player}</button>
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
                    //render UI
                    this.setState({
                        renderUI: <>
                            <p>Who do you want to scent?</p>
                        </>
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
                            <p>Who do you want to scent?</p>
                        </>
                    })
                }
            })

            //The Fox's action
            foxSocket.on('GetScentPlayers', (data) => {
                document.getElementById("cupid-layer1").classList.remove("in-game-cupid-layer-container-invisible")
                document.getElementById("cupid-layer2").classList.remove("in-game-cupid-layer-container-invisible")
                document.getElementById("cupid-layer1").classList.remove("in-game-cupid-layer-container-visible")
                document.getElementById("cupid-layer2").classList.remove("in-game-cupid-layer-container-visible")

                document.getElementById("cupid-layer1").classList.add("in-game-cupid-layer-container-invisible")
                document.getElementById("cupid-layer2").classList.add("in-game-cupid-layer-container-visible")

                this.setState({
                    renderTargetRole: <p>Is there any werewolves near <b>{target}</b>? <b>{data ? "YES" : "NO"}</b></p>,
                    endTurnConfirm: <button type="button" onClick={this.endTurnBttn}>End turn</button>
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