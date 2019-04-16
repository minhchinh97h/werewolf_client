import React, { Component } from 'react'

import {DisplayPlayerNames, DisplayPlayerNamesSocket} from './DisplayPlayerNames/DisplayPlayerNames'
import DisplayCards from './DisplayCards/DisplayCards'
import {DisplayChosenCards, GetCurrentRolesSocket} from './DisplayChosenCards/DisplayChosenCards'

import Header from '../../Header/Header'
import socketIOClient from 'socket.io-client'
import serverUrl from '../../../serverUrl'
import "./WaitingRoom.css"


let GetAdminSocket,
    StartGameSocket

class WaitingRoom extends Component{
    _isMounted = false

    state = {
        admin: "",
        numberOfPlayers: 0,
        ifStartGame: false,
        renderDisplayCardTabWhetherPlayerIsAdmin: null,
        renderStartButtonIfAdmin: null
    }

    startGameBttn = (e) => {
        StartGameSocket.emit('start', this.props.match.params.roomid)

        this.setState({
            renderStartButtonIfAdmin: null
        })
    }

    componentDidMount(){
        this._isMounted = true

        if(this._isMounted){

            //Display header
            document.getElementById("header").classList.remove("hide-header")

            //Socket to get admin of the room
            GetAdminSocket = socketIOClient(serverUrl +'get-admin', {
                query: {
                    roomid: this.props.match.params.roomid
                }
            })

            GetAdminSocket.on('connect', () => {
                GetAdminSocket.emit('JoinRoom', this.props.match.params.roomid)
            })

            GetAdminSocket.on('GetAdmin', data => {
                this.setState({
                    admin: data.admin,
                    numberOfPlayers: data.numberOfPlayers
                })
    
                if(this.props.match.params.username === data.admin){
                    this.setState({
                        renderDisplayCardTabWhetherPlayerIsAdmin: <DisplayCards roomid = {this.props.match.params.roomid}
                                                                        admin = {this.state.admin}
                                                                        username = {this.props.match.params.username}
                                                                    />,
                        renderStartButtonIfAdmin:   <div className="start-button-container">
                                                        <button type='button' onClick={this.startGameBttn}>Start</button>
                                                    </div>
                                                                    
                    })
                }
                else{
                    this.setState({
                        renderDisplayCardTabWhetherPlayerIsAdmin: <>
                                                                <div className = "display-chosen-cards-section" id="display-cards-container">
                                                                    <div className = "title-of-chosen-cards-tab">
                                                                        <h4>Card Collection</h4>
                                                                    </div>
                                                                    <DisplayChosenCards roomid = {this.props.match.params.roomid} />
                                                                </div>
                                                                </>
                    })
                }
            })
            
            StartGameSocket = socketIOClient(serverUrl + 'start-game')

            StartGameSocket.on('connect', () => {
                StartGameSocket.emit('JoinRoom', this.props.match.params.roomid)
            })
            
            StartGameSocket.on('RedirectToGameRoom', data => {
                if(data === "ok")
                    this.props.history.push('/in-game-room/' + this.props.match.params.roomid + '/' + this.props.match.params.username)
            })
        }
    }

    componentWillUnmount(){
        this._isMounted = false
        GetAdminSocket.disconnect()
        StartGameSocket.disconnect()
        DisplayPlayerNamesSocket.disconnect()
        if(GetCurrentRolesSocket)
            GetCurrentRolesSocket.disconnect()
    }
    
    componentDidUpdate(prevProps, prevState){
    }

    render(){
        return(
            <>
            <Header />

            <div className="waiting-room-container">
                <div className="waiting-room-title">
                    <h2>Waiting Room</h2>
                </div>
                
                
                <div className="waiting-room-main-data-container" >
                
                    {this.state.renderDisplayCardTabWhetherPlayerIsAdmin}

                    <div className = "room-information-container" id="room-information-container">
                        <div className= "room-id-and-number-of-players-container">
                            <p>Room ID: {this.props.match.params.roomid} </p>
                            {/* <p>No. of Players: {this.state.numberOfPlayers} </p> */}
                            <p>Admin: {this.state.admin}</p>
                            <p>Name: {this.props.match.params.username}</p>
                        </div>

                        <div className = "display-player-names-container">
                            <DisplayPlayerNames roomid = {this.props.match.params.roomid} />
                        </div>

                        {this.state.renderStartButtonIfAdmin}
                    </div>
                </div>
            </div>
            </>
        ) 
    }
}

export {WaitingRoom, GetAdminSocket, StartGameSocket}