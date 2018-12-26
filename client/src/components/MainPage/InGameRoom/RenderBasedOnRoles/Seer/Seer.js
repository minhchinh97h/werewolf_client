import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'

import GetPlayers from '../../GetPlayers/GetPlayers'

const serverUrl = 'http://localhost:3001/'

let seer_player_bttn_ids = []

class Seer extends Component{

    state = {
        renderUI: null,
        renderPlayers: null,
        personToSee: null,
        renderTargetRole: null,
        confirmPopup: null,
        endTurnConfirm: null
    }

    playerToRevealBttn = (name, bttnId, e) => {
        let sendingData = {
            roomid: this.props.roomid,
            player: name
        }

        const socket = socketIOClient(serverUrl + 'seer')

        // socket.on('connect', () => { 
        //     socket.emit('JoinRoom', sendingData)
        // })


        if(window.confirm("Do you want to view " + name + "'s card?")){
            socket.emit('Request', sendingData)

            seer_player_bttn_ids.forEach((bttnId, index) => {
                document.getElementById(bttnId).disabled = true
            })


        }

    }

    endTurnBttn = () => {
        const socket = socketIOClient(serverUrl + 'retrieve-next-turn')
        
        let sendingData = {
            roomid: this.props.roomid,
            role: 'Seer/ Fortune Teller'
        }

        socket.on('connect', () => {
            socket.emit('JoinRoom', sendingData)
        })
    }   

    componentDidMount(){
        // to display all the players that are from the room
        const getPlayerSocket = socketIOClient(serverUrl + 'main-page', {
            query: {
                roomid : this.props.roomid
            }
        } )
        getPlayerSocket.on('GetPlayersAt' + this.props.roomid, data => {this.setState({
            renderPlayers: data.map((player, index) => {
                if(player !== this.props.username){
                    let id = "seer_player_bttn_" + index

                    seer_player_bttn_ids.push(id)

                    return(
                        <div key = {player}>
                            <button id={id} type="button" onClick={this.playerToRevealBttn.bind(this, player, id)}>{player}</button>
                        </div>
                    )
                }
            })
        })})

        //Handle the first round
        const socket = socketIOClient(serverUrl + 'in-game')

        socket.on('connect', () => {
            socket.emit('JoinRoom', this.props.roomid)
        })

        //Retrieve the 1st turn, if the player is the first to be called, then render its ui
        socket.on('Retrieve1stTurn', data => {
            if(data === this.props.username){
                this.setState({
                    renderUI: <>
                        <div>
                            <p>Who do you want to reveal?</p>
                        </div>
                    </>
                })

                //Seer's action
                const seerSocket = socketIOClient(serverUrl + 'seer')

                seerSocket.on('RevealPlayer', (data) => {
                    this.setState({
                        renderTargetRole: <b>The target's role is: {data}</b>,
                        endTurnConfirm: <button type="button" onClick={this.endTurnBttn}>End turn</button>
                    })
                })
            }
        })


        //Handle the called turn 
        const calledTurnSocket = socketIOClient(serverUrl + 'retrieve-next-turn')

        calledTurnSocket.on('getNextTurn', data => {
            console.log(data)
            if(data.name === this.props.username){
                this.setState({
                    renderUI: <>
                        <div>
                            <p>Who do you want to reveal?</p>
                        </div>
                    </>
                })
    
                //Seer's action
                const seerSocket = socketIOClient(serverUrl + 'seer')
    
                seerSocket.on('RevealPlayer', (data) => {
                    this.setState({
                        renderTargetRole: <b>The target's role is: {data}</b>,
                        endTurnConfirm: <button type="button" onClick={this.endTurnBttn}>End turn</button>
                    })
                })
            }
        })

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

                {this.state.endTurnConfirm}
            </>
        )
    }
}   

export default Seer