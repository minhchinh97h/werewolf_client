import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'

import GetPlayers from '../../GetPlayers/GetPlayers'

const serverUrl = 'http://localhost:3001/'

let bear_target_bttn_ids = [],
    players = []

class BearLeader extends Component{
    _isMounted = false

    state = {
        renderUI: null,
        renderPlayers: null,

    }

    PlayerToScent = (name, index, e) => {

    }


    componentDidMount(){
        this._isMounted = true

        if(this._isMounted){
            // to display all the players that are from the room (every character must have)
            const getPlayerSocket = socketIOClient(serverUrl + 'main-page')

            getPlayerSocket.on('connect', () => {
                getPlayerSocket.emit('RequestToGetPlayersAndJoinRoom', this.props.roomid)
            })

            getPlayerSocket.on('GetPlayers', data => {
                this.setState({
                    renderPlayers: data.map((player, index) => {
                        if(player !== this.props.username){
                            players.push(player)
                            let id = "bear_target_bttn_" + index
    
                            bear_target_bttn_ids.push(id)
    
                            return(
                                <div key = {player}>
                                    <button id={id} type="button" onClick={this.PlayerToScent.bind(this, player, index)}>{player}</button>
                                </div>
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
                    this.setState({
                        renderUI: <>
                            <div>
                                <p>Who do you want to scent its neighbor?</p>
                            </div>
                        </>
                    })

                    //Bear's action
                    const bearSocket = socketIOClient(serverUrl + 'bear')

                    bearSocket.on('ConnectedPlayers', (data) => {
                        this.setState({
                            renderTargetConnection: <b>{data.player1} is now connected with {data.player2}</b>,
                            endTurnConfirm: <button type="button" onClick={this.endTurnBttn}>End turn</button>
                        })
                    })
                }
            })

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
                            <div>
                                <p>Who do you want to scent its neighbor?</p>
                            </div>
                        </>
                    })
        
                    //Bear's action
                    const bearSocket = socketIOClient(serverUrl + 'bear')
        
                    bearSocket.on('ConnectedPlayers', (data) => {
                        this.setState({
                            renderTargetConnection: <b>{data.player1} is now connected with {data.player2}</b>,
                            endTurnConfirm: <button type="button" onClick={this.endTurnBttn}>End turn</button>
                        })
                    })
                }
            })
        }
    }

    componentWillUnmount(){
        this._isMounted = false
    }

    render(){
        return(
            <>
                {this.state.renderUI}

                <br></br>

                {this.state.renderPlayers}
            </>
        )
    }
}   

export default BearLeader