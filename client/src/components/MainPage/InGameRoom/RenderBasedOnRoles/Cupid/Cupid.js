import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'

const serverUrl = 'http://localhost:3001/'

let cupid_target_bttn_ids = [],
    players= [],
    playersToConnect = []

class Cupid extends Component{

    state = {
        renderUI: null,
        renderPlayers: null,
        renderTargetConnection: null,
        endTurnConfirm: null
    }

    playersToConnect = (name, index, bttnId, e) => {
        if(window.confirm("Do you want to choose " + name + "?")){
            playersToConnect.push(name)

            document.getElementById(bttnId).disabled = true

            if(playersToConnect.length === 2){
                const socket = socketIOClient(serverUrl + 'cupid')

                let sendingData = {
                    roomid: this.props.roomid,
                    playersToConnect: playersToConnect
                }

                socket.emit('RequestToConnectPlayers', sendingData)
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
                        let id = "cupid_target_bttn_" + index

                        cupid_target_bttn_ids.push(id)

                        return(
                            <div key = {player}>
                                <button id={id} type="button" onClick={this.playersToConnect.bind(this, player, index, id)}>{player}</button>
                            </div>
                        )
                    }
                })
        })})

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
                            <p>Who do you want to connect?</p>
                        </div>
                    </>
                })

                //Cupid's action
                const cupidSocket = socketIOClient(serverUrl + 'cupid')

                cupidSocket.on('ConnectedPlayers', (data) => {
                    this.setState({
                        renderTargetConnection: <b>{data.player1} is now connected with {data.player2}</b>,
                        endTurnConfirm: <button type="button" onClick={this.endTurnBttn}>End turn</button>
                    })
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
            if(data.name === this.props.username){

                //render UI

                this.setState({
                    renderUI: <>
                        <div>
                            <p>Who do you want to connect?</p>
                        </div>
                    </>
                })
    
                //Cupid's action
                const cupidSocket = socketIOClient(serverUrl + 'cupid')
    
                cupidSocket.on('ConnectedPlayers', (data) => {
                    this.setState({
                        renderTargetConnection: <b>{data.player1} is now connected with {data.player2}</b>,
                        endTurnConfirm: <button type="button" onClick={this.endTurnBttn}>End turn</button>
                    })
                })
            }
        })
    }

    componentDidUpdate(prevProps, prevState){
        
    }

    render(){
        return(
            <>
                {this.state.renderUI}
                
                <br></br>

                {this.state.renderPlayers}

                <br></br>

                {this.state.renderTargetConnection}

                <br></br>

                {this.state.endTurnConfirm}
            </>
        )
    }
}   

export default Cupid