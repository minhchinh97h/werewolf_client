import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'


import BearLeader from './RenderBasedOnRoles/BearLeader/BearLeader'
import Cupid from './RenderBasedOnRoles/Cupid/Cupid'
import DevotedServant from './RenderBasedOnRoles/DevotedServant/DevotedServant'
import DogWolf from './RenderBasedOnRoles/DogWolf/DogWolf'
import Hunter from './RenderBasedOnRoles/Hunter/Hunter'
import LittleGirl from './RenderBasedOnRoles/LittleGirl/LittleGirl'
import NoAbilityFolk from './RenderBasedOnRoles/NoAbilityFolk/NoAbilityFolk'
import Seer from './RenderBasedOnRoles/Seer/Seer'
import TheFox from './RenderBasedOnRoles/TheFox/TheFox'
import TheKnight from './RenderBasedOnRoles/TheKnight/TheKnight'
import ThePiedPiper from './RenderBasedOnRoles/ThePiedPiper/ThePiedPiper'
import TheSavior from './RenderBasedOnRoles/TheSavior/TheSavior'
import TheScapegoat from './RenderBasedOnRoles/TheScapegoat/TheScapegoat'
import TheSibblings from './RenderBasedOnRoles/TheSibblings/TheSibblings'
import Thief from './RenderBasedOnRoles/Thief/Thief'
import Werewolves from './RenderBasedOnRoles/Werewolves/Werewolves'
import WildChild from './RenderBasedOnRoles/WildChild/WildChild'
import Witch from './RenderBasedOnRoles/Witch/Witch'

import Header from '../../Header/Header'

import "./InGameRoom.css"

import serverUrl from '../../../serverUrl'

let socket

class InGameRoom extends Component{
    _isMounted = false

    state = {
        renderPlayerRole: null,
        timer: null,
        renderRoleUI: null,
        renderStartBttn: null,
        startBttnClicked: false,
        isAdmin: false
    }

    startBttn = () => {
        const socket = socketIOClient(serverUrl + 'in-game')

        socket.emit('RequestToStartTheGame1stRound', this.props.match.params.roomid)

        this.setState({
            startBttnClicked: true
        })
    }

    componentDidMount(){
        this._isMounted = true

        if(this._isMounted){
            //Get game info
            socket = socketIOClient(serverUrl + 'in-game')

            socket.on('connect', () => {
                socket.emit('JoinRoom', this.props.match.params.roomid)
            })

            //Get admin to broadcast the request to join the game when start button is pressed and to retrieve the game info
            //We need to shrink the number of times that all the players make requests to only one (only admin) so that
            //the server does not need to receive so many redundant incoming requests

            const adminSocket = socketIOClient(serverUrl + 'get-admin', {
                query: {
                    roomid: this.props.match.params.roomid
                }
            })
            
            adminSocket.on('connect', () => {
                adminSocket.emit('JoinRoom', this.props.match.params.roomid)
            })

            adminSocket.on('GetAdmin', data => {
                if(this.props.match.params.username === data.admin){
                    this.setState({
                        renderStartBttn: <button type="button" onClick={this.startBttn}>Start the rounds</button>,
                        isAdmin: true
                    })
                }
            })

            //when the start button is pressed (state is changed), get the game info (this is socket.io's event so that every listener
            //in the room channel will receive the data whenever the event is triggered)
            socket.on('RetrieveGameInfo', data => {
                data.forEach((row) => {
                    if(!row.special){
                        row.player.forEach(name => {
                            if(name === this.props.match.params.username){

                                this.setState({
                                    renderPlayerRole: row.name
                                })

                                if(row.name === "Werewolves"){
                                    this.setState({
                                        renderRoleUI: <Werewolves roomid = {this.props.match.params.roomid} username = {this.props.match.params.username}/>
                                    })
                                }

                                else if(row.name === "Ordinary Townsfolk"){
                                    this.setState({
                                        renderRoleUI: <NoAbilityFolk roomid = {this.props.match.params.roomid} username = {this.props.match.params.username}/>
                                    })
                                }

                                else if(row.name === "Seer/ Fortune Teller"){
                                    this.setState({
                                        renderRoleUI: <Seer roomid = {this.props.match.params.roomid} username = {this.props.match.params.username}/>
                                    })
                                }

                                else if(row.name === "Hunter"){
                                    this.setState({
                                        renderRoleUI: <Hunter roomid = {this.props.match.params.roomid} username = {this.props.match.params.username}/>
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

                                else if(row.name === "Little Girl"){
                                    this.setState({
                                        renderRoleUI: <LittleGirl roomid = {this.props.match.params.roomid} username = {this.props.match.params.username} />
                                    })
                                }

                                else if(row.name === "Thief"){
                                    this.setState({
                                        renderRoleUI: <Thief roomid = {this.props.match.params.roomid} username = {this.props.match.params.username} />
                                    })
                                }

                                else if(row.name === "The village Idiot"){
                                    this.setState({
                                        renderRoleUI: <NoAbilityFolk roomid = {this.props.match.params.roomid} username = {this.props.match.params.username} />
                                    })
                                }

                                else if(row.name === "The ancient"){
                                    this.setState({
                                        renderRoleUI: <NoAbilityFolk roomid = {this.props.match.params.roomid} username = {this.props.match.params.username} />
                                    })
                                }

                                else if(row.name === "The scapegoat"){
                                    this.setState({
                                        renderRoleUI: <TheScapegoat roomid = {this.props.match.params.roomid} username = {this.props.match.params.username}/>
                                    })
                                }

                                else if(row.name === "The savior"){
                                    this.setState({
                                        renderRoleUI: <TheSavior roomid = {this.props.match.params.roomid} username = {this.props.match.params.username}/>
                                    })
                                }

                                else if(row.name === "The pied piper"){
                                    this.setState({
                                        renderRoleUI: <ThePiedPiper roomid = {this.props.match.params.roomid} username = {this.props.match.params.username}/>
                                    })
                                }

                                else if(row.name === "The villager villager"){
                                    this.setState({
                                        renderRoleUI: <NoAbilityFolk roomid = {this.props.match.params.roomid} username = {this.props.match.params.username}/>
                                    })
                                }

                                else if(row.name === "The two sisters"){
                                    this.setState({
                                        renderRoleUI: <TheSibblings roomid = {this.props.match.params.roomid} username = {this.props.match.params.username}/>
                                    })
                                }

                                else if(row.name === "The three brothers"){
                                    this.setState({
                                        renderRoleUI: <TheSibblings roomid = {this.props.match.params.roomid} username = {this.props.match.params.username}/>
                                    })
                                }

                                else if(row.name === "The knight with the rusty sword"){
                                    this.setState({
                                        renderRoleUI: <TheKnight roomid = {this.props.match.params.roomid} username = {this.props.match.params.username}/>
                                    })
                                }

                                else if(row.name === "The fox"){
                                    this.setState({
                                        renderRoleUI: <TheFox roomid = {this.props.match.params.roomid} username = {this.props.match.params.username}/>
                                    })
                                }

                                else if(row.name === "The bear leader"){
                                    this.setState({
                                        renderRoleUI: <BearLeader roomid = {this.props.match.params.roomid} username = {this.props.match.params.username}/>
                                    })
                                }

                                else if(row.name === "The devoted servant"){
                                    this.setState({
                                        renderRoleUI: <DevotedServant roomid = {this.props.match.params.roomid} username = {this.props.match.params.username}/>
                                    })
                                }

                                else if(row.name === "The wild child"){
                                    this.setState({
                                        renderRoleUI: <WildChild roomid = {this.props.match.params.roomid} username = {this.props.match.params.username}/>
                                    })
                                }

                                else if(row.name === "The dog wolf"){
                                    this.setState({
                                        renderRoleUI: <DogWolf roomid = {this.props.match.params.roomid} username = {this.props.match.params.username}/>
                                    })
                                }

                                

                                
                            }
                        })
                    }
                })
                
            })

            //Handle the first round
            const firstRoundSocket = socketIOClient(serverUrl + 'in-game')

            firstRoundSocket.on('connect', () => {
                firstRoundSocket.emit('JoinRoom', this.props.match.params.roomid)
            })

            //after the timer counts to 0, have to inform players that Round 1 will start soon

            // let currentSecond = 10

            firstRoundSocket.on('RetrieveGameStart1stRound', data => {
                if(data === 'ok'){
                //     let timer = setInterval(() => {
                //         currentSecond--

                //         if(currentSecond < 0){
                firstRoundSocket.emit('RequestToGet1stTurn', this.props.match.params.roomid)
                //             clearInterval(timer)
                //         }
                //     }, 1000)
                }
            })
        }
        

        //This below timer is for notifying the players when the game starts - needs to be synchronous with all the players

        // let currentSecond = 10
        
        // let timer = setInterval(() => {
        //     this.setState({
        //         timer: currentSecond
        //     })
        //     currentSecond--

        //     if(currentSecond < 0){
                
        //         clearInterval(timer)
        //     }
            
        // }, 1000)
        
    }

    componentWillUnmount(){
        this._isMounted = false
    }

    componentDidUpdate(prevProps, prevState){
        if(this.state.startBttnClicked !== prevState.startBttnClicked){
            this.setState({
                renderStartBttn: null
            })
        }

        if(this.state.isAdmin !== prevState.isAdmin && this.state.isAdmin){
            socket.emit('JoinRoomAndGetGameInfo', this.props.match.params.roomid)
        }
    }

    ChooseUserTab = (e) => {
        //Display which user tab is highlighted
        document.getElementById("user-tab-button").classList.remove("tab-active")
        document.getElementById("card-collection-button").classList.remove("tab-active")
        document.getElementById("final-tab-button").classList.remove("tab-active")

        document.getElementById("user-tab-button").classList.add("tab-active")


        //transition to user tab, card collection tab of Admin page is automatically shown at first (firstly visible, others are invisible)
        document.getElementById("room-information-container").classList.remove("room-information-container-visible")
        document.getElementById("display-cards-container").classList.remove("display-cards-container-invisible")

        document.getElementById("room-information-container").classList.add("room-information-container-visible")
        document.getElementById("display-cards-container").classList.add("display-cards-container-invisible")
    }

    ChooseMainTab = () => {
        //Display which card collection tab is highlighted
        document.getElementById("user-tab-button").classList.remove("tab-active")
        document.getElementById("card-collection-button").classList.remove("tab-active")
        document.getElementById("final-tab-button").classList.remove("tab-active")

        document.getElementById("card-collection-button").classList.add("tab-active")


        //transition to card collection tab
        document.getElementById("room-information-container").classList.remove("room-information-container-visible")
        document.getElementById("display-cards-container").classList.remove("display-cards-container-invisible")
    }

    ChooseSpecialRoleTab = () => {
        //Display which final tab is highlighted
        document.getElementById("user-tab-button").classList.remove("tab-active")
        document.getElementById("card-collection-button").classList.remove("tab-active")
        document.getElementById("final-tab-button").classList.remove("tab-active")

        document.getElementById("final-tab-button").classList.add("tab-active")
    }

    render(){
        return(
            <>
            {/* Header for in game room */}
            <div className="in-game-header-container">
                <button className="in-game-header-item-holder" onClick={this.ChooseUserTab}>
                    <i className="fas fa-user fa-lg"></i>
                </button>

                <button className="in-game-header-item-holder" onClick={this.ChooseMainTab}>
                    <i className="fas fa-boxes fa-lg"></i>

                </button>
                <button className="in-game-header-item-holder" onClick={this.ChooseSpecialRoleTab}>
                    <i className="fas fa-clipboard-list fa-lg"></i>
                </button>
            </div>

            <div className="in-game-main-container">
                <div className="in-game-title">
                    <h2>In Game Room</h2>
                </div>

                <div className="in-game-role-tab-container">
                    <div className="in-game-role-tab-title">
                        <h4>{this.state.renderPlayerRole}</h4>
                    </div>
                    <div className="in-game-role-tab-main">
                        {this.state.renderRoleUI}
                        {this.state.renderStartBttn}
                    </div>
                </div>
            </div>
            </>
        ) 
    }
}

export default InGameRoom