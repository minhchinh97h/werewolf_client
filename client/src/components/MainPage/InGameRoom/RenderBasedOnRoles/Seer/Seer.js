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
        confirmPopup: null
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


        //Handle rounds
        const socket = socketIOClient(serverUrl + 'in-game')

        socket.on('connect', () => {
            socket.emit('JoinRoom', this.props.roomid)
        })

        //after the timer counts to 0, have to inform players that Round 1 will start soon
        let currentSecond = 10

        socket.on('RetrieveGameStart1stRound', data => {
            if(data === 'ok'){
                let timer = setInterval(() => {
                    currentSecond--

                    if(currentSecond < 0){
                        socket.emit('RequestToGet1stTurn', this.props.roomid)
                        clearInterval(timer)
                    }
                }, 1000)
            }
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
            }
        })

        const seerSocket = socketIOClient(serverUrl + 'seer')

        seerSocket.on('RevealPlayer', (data) => {
            this.setState({
                renderTargetRole: <b>The target's role is: {data}</b>
            })
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
            </>
        )
    }
}   

export default Seer