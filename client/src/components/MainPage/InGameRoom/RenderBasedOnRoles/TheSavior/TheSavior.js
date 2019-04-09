import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'

import GetPlayers from '../../GetPlayers/GetPlayers'

const serverUrl = 'http://localhost:3001/'

let protectTarget = '',
    lastProtectedPlayer = '',
    firstRoundSocket,
    saviorSocket,
    calledTurnSocket,
    getNextTurnSocket,
    getPlayerSocket


class TheSavior extends Component{
    _isMounted = false

    state = {
        isDead: false,
        isSilence: false,
        renderPlayers: null,
        renderUI: null,
        renderSaviorAction: null,
        protectTarget: '',
        receiveTurn: false
    }

    ProtectPlayer = (name, e) => {
        protectTarget = name

        if(window.confirm("Do you want to protect " + name + "?")){

            let sendingData = {
                roomid: this.props.roomid,
                protectTarget: protectTarget
            }

            saviorSocket.emit('RequestToProtectPlayer', sendingData)

            this.setState({protectTarget})
        }
    }

    endTurnBttn = () => {
        let sendingData = {
            roomid: this.props.roomid,
            role: 'The savior'
        }

        getNextTurnSocket.emit('RequestToGetNextTurn', sendingData)
        this.setState({endTurnConfirm: null})
    }  

    componentDidMount(){
        this._isMounted = true

        if(this._isMounted){
            saviorSocket = socketIOClient(serverUrl + 'savior')
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
                    saviorSocket.emit('RequestToGetLastProtectedPlayer', this.props.roomid)

                    saviorSocket.on('LastProtectedPlayer', data => {
                        lastProtectedPlayer = data

                        this.setState({
                            renderUI: <>
                                    <p>Who do you want to protect?</p>
                            </>,
                            receiveTurn: true
                        })
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
                    saviorSocket.emit('RequestToGetLastProtectedPlayer', this.props.roomid)

                    saviorSocket.on('LastProtectedPlayer', data => {
                        lastProtectedPlayer = data

                        this.setState({
                            renderUI: <>
                                    <p>Who do you want to protect?</p>
                            </>,
                            receiveTurn: true
                        })
                    })
                }
            })

            

            //Savior's action
            saviorSocket.on('ProtectedPlayer', (data) => {
                document.getElementById("cupid-layer1").classList.remove("in-game-cupid-layer-container-invisible")
                document.getElementById("cupid-layer2").classList.remove("in-game-cupid-layer-container-invisible")
                document.getElementById("cupid-layer1").classList.remove("in-game-cupid-layer-container-visible")
                document.getElementById("cupid-layer2").classList.remove("in-game-cupid-layer-container-visible")

                document.getElementById("cupid-layer1").classList.add("in-game-cupid-layer-container-invisible")
                document.getElementById("cupid-layer2").classList.add("in-game-cupid-layer-container-visible")

                if(data === 'ok'){
                    

                    this.setState({
                        renderSaviorAction: <p><b>{this.state.protectTarget}</b> is protected!</p>,
                        endTurnConfirm: <button type="button" onClick={this.endTurnBttn}>End turn</button>
                    })
                }
            })

            
        }
    }

    componentWillUnmount(){
        this._isMounted = false

        firstRoundSocket.disconnect()
        saviorSocket.disconnect()
        calledTurnSocket.disconnect()
        getNextTurnSocket.disconnect()
        getPlayerSocket.disconnect()
    }

    componentDidUpdate(prevProps, prevState){
        if(this.state.receiveTurn && this.state.receiveTurn !== prevState.receiveTurn){
            // to display all the players that are from the room (every character must have)
            getPlayerSocket = socketIOClient(serverUrl + 'main-page')

            getPlayerSocket.on('connect', () => {
                getPlayerSocket.emit('RequestToGetPlayers', this.props.roomid)
            })

            getPlayerSocket.on('GetPlayers', data => {
                this.setState({
                    renderPlayers: data.map((player, index) => {
                        let id = "savior_target_bttn_" + player

                        if(player === lastProtectedPlayer)
                            return(
                                <button key = {player} id={id} type="button" className="grayder-background" onClick={this.ProtectPlayer.bind(this, player)} disabled>{player}</button>
                            )

                        else
                            return(
                                <button key = {player} id={id} type="button" onClick={this.ProtectPlayer.bind(this, player)}>{player}</button>
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
                {this.state.renderSaviorAction}
                {this.state.endTurnConfirm}
            </div>  
            </>
        )
    }
}   

export default TheSavior