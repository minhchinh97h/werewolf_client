import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'


const serverUrl = 'http://localhost:3001/'

let the_fox_target_bttn_ids = [],
    players = []

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

        //Do not need to assign this socket to any room channel because it will only receive the response of its request
        const socket = socketIOClient(serverUrl + 'the-fox')

        if(window.confirm("Do you want to scent " + name + " and the two adjacent neighbors?")){
            socket.emit('RequestToScent', sendingData)

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
                            let id = "the_fox_target_bttn_" + index
    
                            the_fox_target_bttn_ids.push(id)
    
                            return(
                                <div key = {player}>
                                    <button id={id} type="button" onClick={this.playersToRevealBttn.bind(this, player, index)}>{player}</button>
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
                                <p>Who do you want to scent?</p>
                            </div>
                        </>
                    })

                    //The Fox's action
                    const foxSocket = socketIOClient(serverUrl + 'the-fox')

                    foxSocket.on('GetScentPlayers', (data) => {
                        this.setState({
                            renderTargetRole: <b>Is there any werewolves? {data ? "YES": "NO"}</b>,
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
                                <p>Who do you want to scent?</p>
                            </div>
                        </>
                    })
        
                    //The Fox's action
                    const foxSocket = socketIOClient(serverUrl + 'the-fox')
        
                    foxSocket.on('GetScentPlayers', (data) => {
                        this.setState({
                            renderTargetRole: <b>Is there any werewolves? {data ? "YES" : "NO"}</b>,
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

                {this.state.renderTargetRole}

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

export default TheFox