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


const serverUrl = 'http://localhost:3001/'

let socket

class InGameRoom extends Component{
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
        //Get game info
        socket = socketIOClient(serverUrl + 'in-game')

        socket.on('connect', () => {
            socket.emit('JoinRoom', this.props.match.params.roomid)
        })

        //Get admin
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

        
        socket.on('RetrieveGameInfo', data => {

            data.forEach((row) => {
                if(row.name === this.props.match.params.username){

                    this.setState({
                        renderPlayerRole: <b>You are {row.role}</b>
                    })

                    if(row.role === "Werewolves"){
                        this.setState({
                            renderRoleUI: <Werewolves roomid = {this.props.match.params.roomid} username = {this.props.match.params.username}/>
                        })
                    }

                    else if(row.role === "Ordinary Townsfolk"){
                        this.setState({
                            renderRoleUI: <NoAbilityFolk roomid = {this.props.match.params.roomid} username = {this.props.match.params.username}/>
                        })
                    }

                    else if(row.role === "Seer/ Fortune Teller"){
                        this.setState({
                            renderRoleUI: <Seer roomid = {this.props.match.params.roomid} username = {this.props.match.params.username}/>
                        })
                    }

                    else if(row.role === "Hunter"){
                        this.setState({
                            renderRoleUI: <Hunter roomid = {this.props.match.params.roomid} username = {this.props.match.params.username}/>
                        })
                    }

                    else if(row.role === "Cupid"){
                        this.setState({
                            renderRoleUI: <Cupid roomid = {this.props.match.params.roomid} username = {this.props.match.params.username} />
                        })
                    }

                    else if(row.role === "Witch"){
                        this.setState({
                            renderRoleUI: <Witch roomid = {this.props.match.params.roomid} username = {this.props.match.params.username} />
                        })
                    }

                    else if(row.role === "Little Girl"){
                        this.setState({
                            renderRoleUI: <LittleGirl roomid = {this.props.match.params.roomid} username = {this.props.match.params.username} />
                        })
                    }

                    else if(row.role === "Thief"){
                        this.setState({
                            renderRoleUI: <Thief roomid = {this.props.match.params.roomid} username = {this.props.match.params.username} />
                        })
                    }

                    else if(row.role === "The village Idiot"){
                        this.setState({
                            renderRoleUI: <NoAbilityFolk roomid = {this.props.match.params.roomid} username = {this.props.match.params.username} />
                        })
                    }

                    else if(row.role === "The ancient"){
                        this.setState({
                            renderRoleUI: <NoAbilityFolk roomid = {this.props.match.params.roomid} username = {this.props.match.params.username} />
                        })
                    }

                    else if(row.role === "The scapegoat"){
                        this.setState({
                            renderRoleUI: <TheScapegoat roomid = {this.props.match.params.roomid} username = {this.props.match.params.username}/>
                        })
                    }

                    else if(row.role === "The savior"){
                        this.setState({
                            renderRoleUI: <TheSavior roomid = {this.props.match.params.roomid} username = {this.props.match.params.username}/>
                        })
                    }

                    else if(row.role === "The pied piper"){
                        this.setState({
                            renderRoleUI: <ThePiedPiper roomid = {this.props.match.params.roomid} username = {this.props.match.params.username}/>
                        })
                    }

                    else if(row.role === "The villager villager"){
                        this.setState({
                            renderRoleUI: <NoAbilityFolk roomid = {this.props.match.params.roomid} username = {this.props.match.params.username}/>
                        })
                    }

                    else if(row.role === "The two sisters"){
                        this.setState({
                            renderRoleUI: <TheSibblings roomid = {this.props.match.params.roomid} username = {this.props.match.params.username}/>
                        })
                    }

                    else if(row.role === "The three brothers"){
                        this.setState({
                            renderRoleUI: <TheSibblings roomid = {this.props.match.params.roomid} username = {this.props.match.params.username}/>
                        })
                    }

                    else if(row.role === "The knight with the rusty sword"){
                        this.setState({
                            renderRoleUI: <TheKnight roomid = {this.props.match.params.roomid} username = {this.props.match.params.username}/>
                        })
                    }

                    else if(row.role === "The fox"){
                        this.setState({
                            renderRoleUI: <TheFox roomid = {this.props.match.params.roomid} username = {this.props.match.params.username}/>
                        })
                    }

                    else if(row.role === "The bear leader"){
                        this.setState({
                            renderRoleUI: <BearLeader roomid = {this.props.match.params.roomid} username = {this.props.match.params.username}/>
                        })
                    }

                    else if(row.role === "The devoted servant"){
                        this.setState({
                            renderRoleUI: <DevotedServant roomid = {this.props.match.params.roomid} username = {this.props.match.params.username}/>
                        })
                    }

                    else if(row.role === "The wild child"){
                        this.setState({
                            renderRoleUI: <WildChild roomid = {this.props.match.params.roomid} username = {this.props.match.params.username}/>
                        })
                    }

                    else if(row.role === "The dog wolf"){
                        this.setState({
                            renderRoleUI: <DogWolf roomid = {this.props.match.params.roomid} username = {this.props.match.params.username}/>
                        })
                    }

                    //Handle the first round
                    const socket = socketIOClient(serverUrl + 'in-game')

                    socket.on('connect', () => {
                        socket.emit('JoinRoom', this.props.match.params.roomid)
                    })

                    //after the timer counts to 0, have to inform players that Round 1 will start soon

                    // let currentSecond = 10

                    socket.on('RetrieveGameStart1stRound', data => {
                        // if(data === 'ok'){
                        //     let timer = setInterval(() => {
                        //         currentSecond--

                        //         if(currentSecond < 0){
                            socket.emit('RequestToGet1stTurn', this.props.roomid)
                        //             clearInterval(timer)
                        //         }
                        //     }, 1000)
                        // }
                    })

                    
                }
            });
        })

        
        

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

    render(){
        return(
            <> 
            {this.state.renderPlayerRole}
            <br></br>

            {/* <p>The game will start after {this.state.timer}</p> */}

            {this.state.renderStartBttn}

            {this.state.renderRoleUI}
            </>
        ) 
    }
}

export default InGameRoom