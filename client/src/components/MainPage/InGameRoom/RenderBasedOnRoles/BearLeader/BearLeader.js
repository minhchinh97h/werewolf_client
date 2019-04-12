import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'

import serverUrl from '../../../../../serverUrl'

let bear_target_bttn_ids = [],
    players = [],
    firstRoundSocket,
    bearSocket,
    calledTurnSocket,
    getPlayerSocket,
    getNextTurnSocket

class BearLeader extends Component{
    _isMounted = false

    state = {
        renderUI: null,
        renderPlayers: null,
        endTurnConfirm: null,
        renderScentTargetNeighbor: null,
        renderLovers: null,
        renderCharmedPlayers: null,
        scentTarget: null,
        receiveTurn: false
    }

    PlayerToScent = (name, index, e) => {
        let playersToScent = []
        if(index >= 1 && index < players.length - 1){
            playersToScent.push(players[index-1])
            playersToScent.push(players[index+1])
        }

        else if (index === 0){
            playersToScent.push(players[index + 1])
        }

        else if(index === players.length - 1){
            playersToScent.push(players[index - 1])
        }

        if(window.confirm("Do you want to scent " + name +"?")){
            let sendingData = {
                roomid: this.props.roomid,
                playersToScent: playersToScent
            }
            bearSocket.emit('RequestToScentPlayer', sendingData)


            this.setState({scentTarget : name})
            players.length = 0
        }
    }

    endTurnBttn = () => {
        let sendingData = {
            roomid: this.props.roomid,
            role: 'The bear leader'
        }

        getNextTurnSocket.emit('RequestToGetNextTurn', sendingData)
        this.setState({endTurnConfirm: null})
    }  

    componentDidMount(){
        this._isMounted = true

        if(this._isMounted){
            bear_target_bttn_ids.length = 0

            bearSocket = socketIOClient(serverUrl + 'bear')

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
                            <p>Who do you want to scent its neighbor?</p>
                        </>,
                        receiveTurn: true
                    })
                }
            })

            //Handle the called turn (every character must have)
            calledTurnSocket = socketIOClient(serverUrl + 'retrieve-next-turn')

            calledTurnSocket.on('connect', () => {
                calledTurnSocket.emit('JoinRoom', this.props.roomid)
            })

            calledTurnSocket.on('getNextTurn', data => {
                if(data === this.props.username){
                    this.setState({
                        renderUI: <>
                            <p>Who do you want to scent its neighbor?</p>
                        </>,
                        receiveTurn: true
                    })
                }
            })

            //Bear's action
            bearSocket.on('ScentPlayer', (data) => {
                document.getElementById("cupid-layer1").classList.remove("in-game-cupid-layer-container-invisible")
                document.getElementById("cupid-layer2").classList.remove("in-game-cupid-layer-container-invisible")
                document.getElementById("cupid-layer1").classList.remove("in-game-cupid-layer-container-visible")
                document.getElementById("cupid-layer2").classList.remove("in-game-cupid-layer-container-visible")

                document.getElementById("cupid-layer1").classList.add("in-game-cupid-layer-container-invisible")
                document.getElementById("cupid-layer2").classList.add("in-game-cupid-layer-container-visible")

                this.setState({
                    renderScentTargetNeighbor: <p>{data ? <>Werewolve(s) exists around <b>{this.state.scentTarget}</b></> : <>There is none of Werewolves around <b>{this.state.scentTarget}</b></>}</p>,
                    endTurnConfirm: <button type="button" onClick={this.endTurnBttn}>End turn</button>
                })
            })
        }
    }

    componentWillUnmount(){
        this._isMounted = false
        
        players.length = 0
        bear_target_bttn_ids.length = 0

        firstRoundSocket.disconnect()
        bearSocket.disconnect()
        calledTurnSocket.disconnect()
        getPlayerSocket.disconnect()
        getNextTurnSocket.disconnect()
    }

    componentDidUpdate(prevProps, prevState){
        if(this.state.receiveTurn && this.state.receiveTurn !== prevState.receiveTurn){
            bear_target_bttn_ids.length = 0
            players.length = 0

            // to display all the players that are from the room (every character must have)
            getPlayerSocket = socketIOClient(serverUrl + 'main-page')

            getPlayerSocket.on('connect', () => {
                getPlayerSocket.emit('JoinRoom', this.props.roomid)
                getPlayerSocket.emit('RequestToGetPlayers', this.props.roomid)
            })

            getPlayerSocket.on('GetPlayers', data => {

                this.setState({
                    renderPlayers: data.map((player, index) => {
                        players.push(player)

                        let id = "bear_target_bttn_" + index

                        bear_target_bttn_ids.push(id)

                        return(
                            <button key = {player} id={id} type="button" onClick={this.PlayerToScent.bind(this, player, index)}>{player}</button>
                        )
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
                {this.state.renderScentTargetNeighbor}
                {this.state.endTurnConfirm}
            </div>  
            </>
        )
    }
}   

export default BearLeader