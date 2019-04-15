import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'


import BearLeader from './RenderBasedOnRoles/BearLeader/BearLeader'
import Cupid from './RenderBasedOnRoles/Cupid/Cupid'
import Seer from './RenderBasedOnRoles/Seer/Seer'
import TheFox from './RenderBasedOnRoles/TheFox/TheFox'
import ThePiedPiper from './RenderBasedOnRoles/ThePiedPiper/ThePiedPiper'
import TheSavior from './RenderBasedOnRoles/TheSavior/TheSavior'
import Werewolves from './RenderBasedOnRoles/Werewolves/Werewolves'
import Witch from './RenderBasedOnRoles/Witch/Witch'
import RoundEnd from './RenderBasedOnRoles/RoundEnd/RoundEnd'

import "./InGameRoom.css"

import serverUrl from '../../../serverUrl'

let votingRoundSocket,
    votedHangedPlayerSocket,
    InGameSocket,
    adminSocket,
    firstRoundSocket,
    roundEndsSocket


class InGameRoom extends Component{
    _isMounted = false

    state = {
        renderPlayerRole: null,
        timer: null,
        renderRoleUI: null,
        renderStartBttn: null,
        startBttnClicked: false,
        isAdmin: false,
        renderLovers: null,
        renderCharmedPlayers: null,
        admin: '',
        isDead: false,
        roundEnds: false,
        gameEnds: false,
        sideWon: null,
    }


    startBttn = () => {

        InGameSocket.emit('RequestToStartTheGame1stRound', this.props.match.params.roomid)

        this.setState({
            renderStartBttn: null
        })
    }

    CloseTheGame = () => {
        let sendingData = {
            username: this.props.match.params.username,
            roomid: this.props.match.params.roomid
        }
        InGameSocket.emit('RequestToCloseGame', sendingData)
    }

    componentWillMount(){

    }

    componentDidMount(){
        this._isMounted = true

        if(this._isMounted){
            //Get game info
            InGameSocket = socketIOClient(serverUrl + 'in-game')

            InGameSocket.on('connect', () => {
                InGameSocket.emit('GetGameInfo', this.props.match.params.roomid)
                InGameSocket.emit('JoinRoom', this.props.match.params.roomid)
            })

            InGameSocket.on('PlayerCloseGame', data => {
                if(data === 'ok'){
                    window.location = '/'
                }
            })

            //Get admin to broadcast the request to join the game when start button is pressed and to retrieve the game info
            //We need to shrink the number of times that all the players make requests to only one (only admin) so that
            //the server does not need to receive so many redundant incoming requests

            adminSocket = socketIOClient(serverUrl + 'get-admin', {
                query: {
                    roomid: this.props.match.params.roomid
                }
            })
            
            adminSocket.on('connect', () => {
                adminSocket.emit('JoinRoom', this.props.match.params.roomid)
            })

            adminSocket.on('GetAdmin', data => {
                this.setState({admin: data.admin})
                if(this.props.match.params.username === data.admin){
                    this.setState({
                        renderStartBttn: <button type="button" onClick={this.startBttn}>Start the game</button>,
                        isAdmin: true
                    })
                }
            })

            //when the start button is pressed (state is changed), get the game info (this is socket.io's event so that every listener
            //in the room channel will receive the data whenever the event is triggered)
            InGameSocket.on('RetrieveGameInfo', data => {
                data.every((row) => {
                    let found = false

                    if(!row.special){
                        row.player.every(name => {
                            if(name === this.props.match.params.username){
                                this.setState({
                                    renderPlayerRole: row.name
                                })

                                if(row.name === "Werewolves"){
                                    this.setState({
                                        renderRoleUI: <Werewolves roomid = {this.props.match.params.roomid} username = {this.props.match.params.username} />
                                    })
                                }

                                else if(row.name === "Seer/ Fortune Teller"){
                                    this.setState({
                                        renderRoleUI: <Seer roomid = {this.props.match.params.roomid} username = {this.props.match.params.username} />
                                    })
                                }

                                else if(row.name === "Cupid"){
                                    this.setState({
                                        renderRoleUI: <Cupid roomid = {this.props.match.params.roomid} username = {this.props.match.params.username} />
                                    })
                                }

                                else if(row.name === "Witch"){
                                    this.setState({
                                        renderRoleUI: <Witch roomid = {this.props.match.params.roomid} username = {this.props.match.params.username} />
                                    })
                                }

                                else if(row.name === "The savior"){
                                    this.setState({
                                        renderRoleUI: <TheSavior roomid = {this.props.match.params.roomid} username = {this.props.match.params.username} />
                                    })
                                }

                                else if(row.name === "The pied piper"){
                                    this.setState({
                                        renderRoleUI: <ThePiedPiper roomid = {this.props.match.params.roomid} username = {this.props.match.params.username} />
                                    })
                                }

                                else if(row.name === "The fox"){
                                    this.setState({
                                        renderRoleUI: <TheFox roomid = {this.props.match.params.roomid} username = {this.props.match.params.username} />
                                    })
                                }

                                else if(row.name === "The bear leader"){
                                    this.setState({
                                        renderRoleUI: <BearLeader roomid = {this.props.match.params.roomid} username = {this.props.match.params.username} />
                                    })
                                }


                                found = true

                                return false
                            }

                            else{
                                this.setState({
                                    renderPlayerRole: "Ordinary Townsfolk"
                                })
                                return true
                            }
                        })
                    }

                    if(found){
                        return false
                    }

                    else{
                        return true
                    }
                })
                
            })

            //Handle the first round
            firstRoundSocket = socketIOClient(serverUrl + 'in-game')

            /* <-----------------------------------------------> */

            //Handle lover (every character must have)

            //Every socket is unique, meaning if a socket joined a room doesnt mean other sockets existing in the same page will join that room
            //Thus, we need to make every 'JoinRoom' emit event explicitly if we want that socket get response from a broadcast.
            
            InGameSocket.on('RevealLovers', (data) => {
                data.forEach((info, index) => {
                    if(info.player === this.props.match.params.username){
                        if(index === 0)
                            this.setState({
                                renderLovers: <p>You are now in love with {data[index+1].player} - {data[index+1].role}</p>
                            })
                        
                        else{
                            this.setState({
                                renderLovers: <p>You are now in love with {data[index-1].player} - {data[index-1].role}</p>
                            })
                        }
                    }
                })
            })

            /* <-----------------------------------------------> */

            //Handle changes of the total charmed players via a socket event (every character must have)
            //Every socket is unique, meaning if a socket joined a room doesnt mean other sockets existing in the same page will join that room
            //Thus, we need to make every 'JoinRoom' emit event explicitly if we want that socket get response from a broadcast.
            
            InGameSocket.emit('RequestToRetrieveCharmPlayers', this.props.match.params.roomid)

            InGameSocket.on('GetListOfCharmed', (data) => {
                data.every((player) => {
                    if(this.props.match.params.username === player){
                        this.setState({
                            renderCharmedPlayers: data.map((player, index) => {
                                let key = 'charmed_' + index
                                return(
                                    <p key={key}>{player}</p>
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

            
            //Handle the end of a round meaning the night (every character must have) 
            roundEndsSocket = socketIOClient(serverUrl + 'retrieve-round-ends')
            roundEndsSocket.on('connect', () => {
                roundEndsSocket.emit('JoinRoom', this.props.match.params.roomid)
            })

            roundEndsSocket.on('RoundEnds', data => {
                if(data.dead instanceof Array)
                    data.dead.forEach((death, i) => {
                        if(this.props.match.params.username === death){
                            this.setState({isDead: true})
                        }
                    })
                
                this.setState({
                    roundEnds: true,
                })
            })

            /* <-----------------------------------------------> */

            //Handle the end of a voting turn meaning the morning (every character must have)
            votingRoundSocket = socketIOClient(serverUrl + 'in-game')

            votingRoundSocket.on('connect', () => {
                votingRoundSocket.emit('JoinRoom', this.props.match.params.roomid)
            })

            votingRoundSocket.on('StartNewRound', data => {
                if(data === "Start new round"){
                    this.setState({
                        roundEnds: false,
                    })

                    if(this.state.isAdmin){
                        InGameSocket.emit('RequestToStartTheGame1stRound', this.props.match.params.roomid)
                    }
                }
            })

            //Get hanged player
            votedHangedPlayerSocket = socketIOClient(serverUrl + 'round-end')
            votedHangedPlayerSocket.on('connect', () => {
                votedHangedPlayerSocket.emit('JoinRoom', this.props.match.params.roomid)
            })

            votedHangedPlayerSocket.on('BroadcastREDeadPlayers', data => {
                data.every((player) => {
                    if(this.props.match.params.username === player){
                        this.setState({isDead: true})
                        return false
                    }
                    return true
                })
            })

            /* <-----------------------------------------------> */

            //Handle the end of the game (every character must have)
            InGameSocket.on('GameEnds', data => {
                if(data === "Human won"){
                    this.setState({sideWon: 'Human'})
                }
                else if(data === "Werewolves won"){
                    this.setState({sideWon: 'Werewolves'})
                }
                else if(data === "Piper won"){
                    this.setState({sideWon: 'Piper'})
                }
                else if(data === "Lovers won")
                    this.setState({sideWon: 'Piper'})

                this.setState({
                    gameEnds: true
                })
            })
        }
    }

    componentWillUnmount(){
        this._isMounted = false

        votingRoundSocket.disconnect()
        votedHangedPlayerSocket.disconnect()
        InGameSocket.disconnect()
        adminSocket.disconnect()
        firstRoundSocket.disconnect()
        roundEndsSocket.disconnect()
    }

    componentDidUpdate(prevProps, prevState){
    }

    ChooseLeftTab = (e) => {
        //Display which left tab is highlighted
        document.getElementById("left-icon").classList.remove("tab-active")
        document.getElementById("middle-icon").classList.remove("tab-active")
        document.getElementById("right-icon").classList.remove("tab-active")

        document.getElementById("left-icon").classList.add("tab-active")


        //transition to the left tab
        document.getElementById("left-tab").classList.remove("in-game-user-tab-container-visible")
        document.getElementById("middle-tab").classList.remove("in-game-role-tab-container-invisible-move-right")
        document.getElementById("middle-tab").classList.remove("in-game-role-tab-container-invisible-move-left")
        document.getElementById("right-tab").classList.remove("in-game-extra-info-tab-container-visible")

        document.getElementById("left-tab").classList.add("in-game-user-tab-container-visible")
        document.getElementById("middle-tab").classList.add("in-game-role-tab-container-invisible-move-right")
    }

    ChooseMiddleTab = () => {
        //Display which middle tab is highlighted
        document.getElementById("left-icon").classList.remove("tab-active")
        document.getElementById("middle-icon").classList.remove("tab-active")
        document.getElementById("right-icon").classList.remove("tab-active")

        document.getElementById("middle-icon").classList.add("tab-active")


        //transition to the middle tab
        document.getElementById("left-tab").classList.remove("in-game-user-tab-container-visible")
        document.getElementById("middle-tab").classList.remove("in-game-role-tab-container-invisible-move-right")
        document.getElementById("middle-tab").classList.remove("in-game-role-tab-container-invisible-move-left")
        document.getElementById("right-tab").classList.remove("in-game-extra-info-tab-container-visible")

    }

    ChooseRightTab = () => {
        //Display which right tab is highlighted
        document.getElementById("left-icon").classList.remove("tab-active")
        document.getElementById("middle-icon").classList.remove("tab-active")
        document.getElementById("right-icon").classList.remove("tab-active")

        document.getElementById("right-icon").classList.add("tab-active")

        //transition to the right tab
        document.getElementById("left-tab").classList.remove("in-game-user-tab-container-visible")
        document.getElementById("middle-tab").classList.remove("in-game-role-tab-container-invisible-move-right")
        document.getElementById("middle-tab").classList.remove("in-game-role-tab-container-invisible-move-left")
        document.getElementById("right-tab").classList.remove("in-game-extra-info-tab-container-visible")

        document.getElementById("right-tab").classList.add("in-game-extra-info-tab-container-visible")
        document.getElementById("middle-tab").classList.add("in-game-role-tab-container-invisible-move-left")
    }

    render(){
        return(
            <>
            {/* Header for in game room */}
            <div className="in-game-header-container">
                <button className="in-game-header-item-holder" onClick={this.ChooseLeftTab} id="left-icon">
                    <i className="fas fa-user fa-lg"></i>
                </button>

                <button className="in-game-header-item-holder tab-active" onClick={this.ChooseMiddleTab} id="middle-icon">
                    <i className="fas fa-boxes fa-lg"></i>

                </button>
                <button className="in-game-header-item-holder" onClick={this.ChooseRightTab} id="right-icon">
                    <i className="fas fa-clipboard-list fa-lg"></i>
                </button>
            </div>

            <div className="in-game-main-container">
                <div className="in-game-title">
                    <h2>In Game Room</h2>
                </div>

                {/* Main tab / middle tab*/}
                <div className="in-game-role-tab-container" id="middle-tab">
                    <div className="in-game-role-tab-title">
                        <h4>{this.state.renderPlayerRole}</h4>
                    </div>

                    {this.state.gameEnds ? 
                        <div className="in-game-role-tab-main">
                            <p>{this.state.sideWon} Won!</p>
                            <button onClick={this.CloseTheGame}>Close</button>
                        </div>
                        :
                        <>
                        {!this.state.roundEnds ?
                            <>
                            {this.state.isDead ?
                                <div className="in-game-role-tab-main">
                                    <p>You are dead</p>
                                </div>
                                :
                                <div className="in-game-role-tab-main">
                                    {this.state.renderRoleUI}
                                </div >
                            }
                            </>
                        :
                            <>
                            {this.state.isDead ?
                                <div className="in-game-role-tab-main">
                                    <p>You are dead</p>
                                </div>
    
                                :
    
                                <div className="in-game-role-tab-main">
                                    <RoundEnd roomid = {this.props.match.params.roomid} username = {this.props.match.params.username} startTime = {new Date().getTime()} UpdateFinishedRenderUI = {this.UpdateFinishedRenderUI}/>
                                </div>
                            }
                            </>
                        }
                        </>
                    }
                    
                    
                </div>

                {/* User tab / left tab*/}
                <div className = "in-game-user-tab-container" id="left-tab">
                    <div className= "in-game-room-info-container">
                        <p>Room ID: {this.props.match.params.roomid} </p>
                        <p>Admin: {this.state.admin}</p>
                        <p>Name: {this.props.match.params.username}</p>
                    </div>

                    {/* History log container */}
                    <div className= "in-game-room-history-container">
                        
                    </div>

                    <div className="in-game-role-tab-start-end-button-container">
                        {this.state.renderStartBttn}
                    </div>
                </div>


                {/* Extra info tab / right tab */}
                <div className = "in-game-extra-info-tab-container" id="right-tab">
                    <div className= "in-game-lover-info">
                        {this.state.renderLovers}
                    </div>

                    <div className= "in-game-charm-info">
                        <h4>List of Charmed Players</h4>
                        {this.state.renderCharmedPlayers}
                    </div>
                </div>
            </div>
            </>
        ) 
    }
}

export default InGameRoom