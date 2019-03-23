import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'


const serverUrl = 'http://localhost:3001/'

let piper_target_bttn_ids = [],
    playersToCharm = []

const piperSocket = socketIOClient(serverUrl + 'piper')
        
class ThePiedPiper extends Component{
    _isMounted = false

    state = {
        renderUI: null,
        renderPlayers: null,
        endTurnConfirm: null,
        renderLovers: null,
        renderCharmedPlayers: null
    }

    PlayersToCharm = (name, index, bttnId, e) => {
        if(window.confirm("Do you want to charm " + name + "?")){
            playersToCharm.push(name)

            document.getElementById(bttnId).disabled = true

            if(playersToCharm.length === 2){
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
        const socket = socketIOClient(serverUrl + 'retrieve-next-turn')
        
        let sendingData = {
            roomid: this.props.roomid,
            role: 'The pied piper'
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
                            let id = "piper_target_bttn_" + index
    
                            piper_target_bttn_ids.push(id)
    
                            return(
                                <div key = {player}>
                                    <button id={id} type="button" onClick={this.PlayersToCharm.bind(this, player, index, id)}>{player}</button>
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
                                <p>Please charm 2 people</p>
                            </div>
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
                            <div>
                                <p>Please charm 2 people</p>
                            </div>
                        </>
                    })
                }
            })

            //Piper's action
            piperSocket.on('CharmedPlayers', (data) => {
                this.setState({
                    endTurnConfirm: <button type="button" onClick={this.endTurnBttn}>End turn</button>
                })
            })

            /* <-----------------------------------------------> */

            //Handle lover (every character must have)
            const loverSocket = socketIOClient(serverUrl + 'in-game')

            //Every socket is unique, meaning if a socket joined a room doesnt mean other sockets existing in the same page will join that room
            //Thus, we need to make every 'JoinRoom' emit event explicitly if we want that socket get response from a broadcast.
            loverSocket.on('connect', () => {
                loverSocket.emit('JoinRoom', this.props.roomid)
            })

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
            const getCharmedSocket = socketIOClient(serverUrl + 'in-game')

            //Every socket is unique, meaning if a socket joined a room doesnt mean other sockets existing in the same page will join that room
            //Thus, we need to make every 'JoinRoom' emit event explicitly if we want that socket get response from a broadcast.
            getCharmedSocket.on('connect', () => {
                getCharmedSocket.emit('JoinRoom', this.props.roomid)
            })

            getCharmedSocket.on('GetListOfCharmed', (data) => {
                console.log(data)
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

export default ThePiedPiper