import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'

import GetPlayers from '../../GetPlayers/GetPlayers'

const serverUrl = 'http://localhost:3001/'

let players = [],
    otherWolves = [],
    targetChoice = ''

class Werewolves extends Component{
    _isMounted = false

    state = {
        renderUI: null,
        renderPlayers: null,
        renderLovers: null,
        endTurnConfirm: null,
        renderOtherChoices: null,
        choseTarget: null,
        renderCharmedPlayers: null,
        renderFinalTarget: null
    }

    chooseTargetBttn = (name, e) => {
        targetChoice = name
        const socket = socketIOClient(serverUrl + 'werewolves')

        let sendingData = {
            choseTarget: name,
            wolfName: this.props.username,
            roomid: this.props.roomid
        }

        socket.emit("RequestMyChoice", sendingData)
    }

    AgreeOnKill = (e) => {
        const socket = socketIOClient(serverUrl + 'werewolves')

        let sendingData = {
            choseTarget: targetChoice
        }

        socket.emit("RequestToAgreeKill", sendingData)
    }

    endTurnBttn = () => {
        const socket = socketIOClient(serverUrl + 'retrieve-next-turn')
        
        let sendingData = {
            roomid: this.props.roomid,
            role: 'Werewolves'
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
                            let id = "werewolves_target_bttn_" + index
    
                            return(
                                <div key = {player}>
                                    <button id={id} type="button" onClick={this.chooseTargetBttn.bind(this, player)}>{player}</button>
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
                                <p>Who do you want to kill?</p>
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
                                <p>Who do you want to kill?</p>
                            </div>
                        </>
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

            /* <-----------------------------------------------> */

            //Handle other werewolves choices && confirmation that the kill target is saved into database && final target
            const otherSocket = socketIOClient(serverUrl + 'werewolves')

            //Join room for the werewolves namespace
            otherSocket.on('connect', () => {
                otherSocket.emit('JoinRoom', this.props.roomid)
            })

            //others choices
            otherSocket.on('OtherChoices', (data) => {
                //to advoid duplication
                otherWolves.every((wolf, index) => {
                    if(wolf.wolfName === data.wolfName){
                        wolf.choseTarget = data.choseTarget

                        return false
                    }
                    
                    wolf.name = data.wolfName
                    wolf.choseTarget = data.choseTarget

                    return true
                })


                this.setState({
                    renderOtherChoices: otherWolves.map((choice, index) => {
                        let id = "other_werewolves_choices_" + index
                        return (<div key={id} id={id}>
                                    {choice.wolfName} : {choice.choseTarget} 
                                </div>)
                    })
                })
            })

            //confirmation
            otherSocket.on('ConfirmKillRespond', data => {
                if(data === "ok"){
                    alert("Confirm kill!")
                }

                else{
                    alert("Kill is not confirmed!")
                }

                this.setState({
                    endTurnConfirm: <button type="button" onClick={this.endTurnBttn}>End turn</button>
                })
            })

            //Final target
            otherSocket.on('ReceiveTheFinalTarget', data => {
                this.setState({
                    renderFinalTarget: <div><p>Final Target is: <strong>{data}</strong></p></div>
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

                {this.state.renderOtherChoices}

                <br></br>

                {this.state.choseTarget}

                <br></br>

                <button onClick={this.AgreeOnKill}>Agree on Kill</button>
            
                <br></br>

                {this.state.renderFinalTarget}

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

export default Werewolves