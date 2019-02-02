import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'


const serverUrl = 'http://localhost:3001/'

let piper_target_bttn_ids = [],
    playersToCharm = []

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
                const socket = socketIOClient(serverUrl + 'cupid')

                let sendingData = {
                    roomid: this.props.roomid,
                    playersToCharm: playersToCharm
                }

                socket.emit('RequestToCharmPlayers', sendingData)

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

                    //Piper's action
                    const piperSocket = socketIOClient(serverUrl + 'piper')

                    piperSocket.on('CharmedPlayers', (data) => {
                        prompt(data[0].player + " is now connected with " + data[1].player)

                        this.setState({
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
                if(data === this.props.username){

                    //render UI

                    this.setState({
                        renderUI: <>
                            <div>
                                <p>Please charm 2 people</p>
                            </div>
                        </>
                    })
        
                    //Piper's action
                    const piperSocket = socketIOClient(serverUrl + 'piper')
        
                    piperSocket.on('CharmedPlayers', (data) => {
                        prompt(data[0].player + " is now connected with " + data[1].player)
                        this.setState({
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

            //Handle changes of the total charmed players via a socket event
            const getCharmedSocket = socketIOClient(serverUrl + 'piper')

            getCharmedSocket.on('GetListOfCharmed', (data) => {
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