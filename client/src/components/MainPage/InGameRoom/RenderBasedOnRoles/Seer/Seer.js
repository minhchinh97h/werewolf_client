import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'

import GetPlayers from '../../GetPlayers/GetPlayers'

import serverUrl from '../../../../../serverUrl'

let seer_target_bttn_ids = [],
    calledTurnSocket,
    firstRoundSocket,
    seerSocket,
    getNextTurnSocket,
    getPlayerSocket

class Seer extends Component{
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

    playerToRevealBttn = (name, bttnId, e) => {
        let sendingData = {
            roomid: this.props.roomid,
            player: name
        }

        if(window.confirm("Do you want to view " + name + "'s card?")){
            seerSocket.emit('Request', sendingData)

            seer_target_bttn_ids.forEach((bttnId, index) => {
                if(document.getElementById(bttnId))
                    document.getElementById(bttnId).disabled = true
            })
        }
    }

    endTurnBttn = () => {
        
        
        let sendingData = {
            roomid: this.props.roomid,
            role: 'Seer/ Fortune Teller'
        }

        getNextTurnSocket.emit('RequestToGetNextTurn', sendingData)

        this.setState({endTurnConfirm: null})
    }   

    componentDidMount(){
        this._isMounted = true
        

        if(this._isMounted){
            seer_target_bttn_ids.length = 0

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
                                <p>Who do you want to reveal?</p>
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
                                <p>Who do you want to reveal?</p>
                        </>,
                        receiveTurn: true
                    })
                }
            })

            seerSocket = socketIOClient(serverUrl + 'seer')

            //Seer's action
            seerSocket.on('RevealPlayer', (data) => {
                document.getElementById("cupid-layer1").classList.remove("in-game-cupid-layer-container-invisible")
                document.getElementById("cupid-layer2").classList.remove("in-game-cupid-layer-container-invisible")
                document.getElementById("cupid-layer1").classList.remove("in-game-cupid-layer-container-visible")
                document.getElementById("cupid-layer2").classList.remove("in-game-cupid-layer-container-visible")

                document.getElementById("cupid-layer1").classList.add("in-game-cupid-layer-container-invisible")
                document.getElementById("cupid-layer2").classList.add("in-game-cupid-layer-container-visible")

                this.setState({
                    renderTargetRole: <p><b>{data.username}</b>'s role is: <b>{data.role}</b></p>,
                    endTurnConfirm: <button type="button" onClick={this.endTurnBttn}>End turn</button>
                })
            })
        }
    }

    componentWillUnmount(){
        this._isMounted = false
        seer_target_bttn_ids.length = 0

        calledTurnSocket.disconnect()
        firstRoundSocket.disconnect()
        seerSocket.disconnect()
        getNextTurnSocket.disconnect()
        getPlayerSocket.disconnect()
        
    }

    componentDidUpdate(prevProps, prevState){
        if(this.state.receiveTurn && this.state.receiveTurn !== prevState.receiveTurn){
            seer_target_bttn_ids.length = 0

            // to display all the players that are from the room (every character must have)
            getPlayerSocket = socketIOClient(serverUrl + 'main-page')

            getPlayerSocket.on('connect', () => {
                getPlayerSocket.emit('JoinRoom', this.props.roomid)
                getPlayerSocket.emit('RequestToGetPlayers', this.props.roomid)
            })

            getPlayerSocket.on('GetPlayers', data => {
                this.setState({
                    renderPlayers: data.map((player, index) => {
                        if(player !== this.props.username){
                            let id = "seer_target_bttn_" + index
    
                            seer_target_bttn_ids.push(id)
    
                            return(
                                <button key = {player} id={id} type="button" onClick={this.playerToRevealBttn.bind(this, player, id)}>{player}</button>
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
                    {this.state.renderTargetRole}
                    {this.state.endTurnConfirm}
                </div>  
            </>
        )
    }
}   

export default Seer