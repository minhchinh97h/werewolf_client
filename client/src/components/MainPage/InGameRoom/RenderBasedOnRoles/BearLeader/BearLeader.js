import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'

import serverUrl from '../../../../../serverUrl'

let bear_target_bttn_ids = [],
    players = []

class BearLeader extends Component{
    _isMounted = false

    state = {
        renderUI: null,
        renderPlayers: null,
        endTurnConfirm: null,
        renderScentTargetNeighbor: null,
        renderLovers: null,
        renderCharmedPlayers: null
    }

    PlayerToScent = (name, index, e) => {
        if(window.confirm("Do you want to scent " + name +"?")){
            const socket = socketIOClient(serverUrl + 'bear')

            let sendingData = {
                roomid: this.props.roomid,
                player: name
            }

            socket.emit('RequestToScentPlayer', sendingData)
        }
    }

    endTurnBttn = () => {
        const socket = socketIOClient(serverUrl + 'retrieve-next-turn')
        
        let sendingData = {
            roomid: this.props.roomid,
            role: 'The bear leader'
        }

        socket.emit('RequestToGetNextTurn', sendingData)
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

                    bearSocket.on('ScentPlayer', (data) => {
                        this.setState({
                            renderScentTargetNeighbor: <b>{data ? 'Werewolve(s) exists' : 'There is none of Werewolves'}</b> ,
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
        
                    bearSocket.on('ScentPlayer', (data) => {
                        this.setState({
                            renderScentTargetNeighbor: <b>{data ? 'Werewolve(s) exists' : 'There is none of Werewolves'}</b>,
                            endTurnConfirm: <button type="button" onClick={this.endTurnBttn}>End turn</button>
                        })
                    })
                }
            })

            /* <-----------------------------------------------> */

            //Handle lover (every character must have)
            const loverSocket = socketIOClient(serverUrl + 'in-game')

            loverSocket.on('RevealLovers', (data) => {
                data.forEach((info, index) => {
                    if(info.player === this.props.username){
                        if(index === 0)
                            this.setState({
                                renderLovers: <b>You are now in love with {data[index+1].player} - {data[index+1].role}</b>
                            })
                        
                        else{
                            this.setState({
                                renderLovers: <b>You are now in love with {data[index-1].player} - {data[index-1].role}</b>
                            })
                        }
                    }
                })
            })

            /* <-----------------------------------------------> */

            //Handle changes of the total charmed players via a socket event (every character must have)
            const getCharmedSocket = socketIOClient(serverUrl + 'piper')

            getCharmedSocket.on('GetListOfCharmed', (data) => {
                data.every((player) => {
                    if(this.props.username === player){
                        this.setState({
                            renderCharmedPlayers: data.map((player, index) => {
                                let key = 'charmed_' + index
                                return(
                                    <div key={key}>
                                        <p>{player}</p>
                                    </div>
                                )
                            })
                        })

                        return false
                    }

                    else
                        return true
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
                {this.state.renderUI}

                <br></br>

                {this.state.renderPlayers}

                <br></br>

                {this.state.renderScentTargetNeighbor}

                <br></br>
                
                <h3>List of Charmed Players: </h3>
                {this.state.renderCharmedPlayers}

                <br></br>

                {this.state.renderLovers}

                <br></br>

                {this.state.endTurnConfirm}
            </>
        )
    }
}   

export default BearLeader