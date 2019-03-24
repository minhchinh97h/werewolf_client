import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'

import serverUrl from '../../../../../serverUrl'

import "./Cupid.css"

let cupid_target_bttn_ids = [],
    playersToConnect = []

//need to set up the socket first, because the when making direct socket to server, server will only response to the received socket
//meaning socket in an onclick function will get response it that scope, the response will not be received in the socket in componentDidMount
const cupidSocket = socketIOClient(serverUrl + 'cupid')

class Cupid extends Component{
    _isMounted = false

    state = {
        renderUI: null,
        renderPlayers: null,
        renderTargetConnection: null,
        endTurnConfirm: null,
        renderLovers: null,
        renderCharmedPlayers: null
    }

    playersToConnect = (name, index, bttnId, e) => {
        if(window.confirm("Do you want to choose " + name + "?")){
            playersToConnect.push(name)

            document.getElementById(bttnId).disabled = true

            if(playersToConnect.length === 2){
                // const socket = socketIOClient(serverUrl + 'cupid')

                let sendingData = {
                    roomid: this.props.roomid,
                    playersToConnect: playersToConnect
                }

                cupidSocket.emit('RequestToConnectPlayers', sendingData)

                playersToConnect.length = 0
            }
        }
    }

    endTurnBttn = () => {
        const socket = socketIOClient(serverUrl + 'retrieve-next-turn')
        
        let sendingData = {
            roomid: this.props.roomid,
            role: 'Cupid'
        }

        socket.emit('RequestToGetNextTurn', sendingData)
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
                        if(player !== this.props.username){
                            let id = "cupid_target_bttn_" + index
    
                            cupid_target_bttn_ids.push(id)
    
                            return(
                                <button key = {player} id={id} type="button" onClick={this.playersToConnect.bind(this, player, index, id)}>{player}</button>
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
                                <p>Who do you want to connect?</p>
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
                                <p>Who do you want to connect?</p>
                        </>
                    })
                }
            })

            //Cupid's action
            cupidSocket.on('ConnectedPlayers', (data) => {
                document.getElementById("cupid-layer1").classList.remove("in-game-cupid-layer-container-invisible")
                document.getElementById("cupid-layer2").classList.remove("in-game-cupid-layer-container-invisible")
                document.getElementById("cupid-layer1").classList.remove("in-game-cupid-layer-container-visible")
                document.getElementById("cupid-layer2").classList.remove("in-game-cupid-layer-container-visible")

                document.getElementById("cupid-layer1").classList.add("in-game-cupid-layer-container-invisible")
                document.getElementById("cupid-layer2").classList.add("in-game-cupid-layer-container-visible")

                this.setState({
                    renderTargetConnection: <p><b>{data[0].player}</b> is now connected with <b>{data[1].player}</b></p>,
                    endTurnConfirm: <button type="button" onClick={this.endTurnBttn}>End turn</button>
                })
            })
        }

    }

    componentWillUnmount(){
        this._isMounted = false
        playersToConnect.length = 0
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
                    {this.state.renderTargetConnection}
                    {this.state.endTurnConfirm}
            </div>  
            </>
        )
    }
}   

export default Cupid