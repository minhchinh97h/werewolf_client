import React, { Component } from 'react'
import Cookies from 'universal-cookie'

import recommendedRoles from '../../validation/recommendedRoles/recommendedRoles'
import currentRoles from '../../validation/currentRoles/currentRoles'

import serverUrl from '../../serverUrl'

import "./Login.css"

const uniqid = require('uniqid')
const axios = require('axios')
const cookies = new Cookies()

let insertedRoomid = "",
    generatedUsername = "",
    roomid

class Login extends Component{
    state={
        username: "",
        roomid: "",
        newUserBttnClicked: false, //meaning the username was created successfully
        newRoomBttnClicked: false,
        joinBttnClicked: false
    }

    newUserButton = () => {
        //Check if the field is not empty
        if(this.state.username !== "" || this.state.username.length > 0){
            //to insert a player info document in Player collection
            axios({
                method: 'post',
                url: serverUrl + 'players/create/' + this.state.username.toString().replace(' ', '-'),
                data: {
                    username: this.state.username,
                    roomid: roomid,
                    timeCreated: Date.now(),
                    status: {
                        alive: 1,
                        dead: 0,
                        silence: 0,
                        connected: "",
                        hypnotized: 0,
                        changed: 0
                    },
                    role: ''
                }
            })
            .then(response => {
                if(response.data === "ok"){
                    this.setState({
                        newUserBttnClicked: true
                    })
                    
                }
                
                //If there is already an identical name
                else{
                    this.DisplayWarningIconForUsername()

                    document.getElementById("warning-username").innerText= "Username already exists"
                }

            })
            .catch(err => {
                this.DisplayWarningIconForUsername()

                document.getElementById("warning-username").innerText= err
            })
        }

        else{
            this.setState({
                newUserBttnClicked: false
            })

            this.DisplayWarningIconForUsername()

            document.getElementById("warning-username").innerText= "You need a name"
        }
    }

    DisplayWarningIconForUsername = () => {
        //Make certain that both warning and approve icons for username are invisible
        document.getElementById("warning-icon-for-username").classList.add("icon-display-invisible")
        document.getElementById("approve-icon-for-username").classList.add("icon-display-invisible")

        //Remove the invisible class to make the warning icon visible
        document.getElementById("warning-icon-for-username").classList.remove("icon-display-invisible")
    }

    DisplayApproveIconForUsername = () => {
        //Make certain that both warning and approve icons for username are invisible
        document.getElementById("warning-icon-for-username").classList.add("icon-display-invisible")
        document.getElementById("approve-icon-for-username").classList.add("icon-display-invisible")

        //Remove the invisible class to make the approve icon visible
        document.getElementById("approve-icon-for-username").classList.remove("icon-display-invisible")
    }


    
    newRoomButton = () => {
        roomid = uniqid()

        this.setState({
            roomid: roomid
        })

        //to verify that the player's username is successfully created and stored in the database
        axios({
            method: 'get',
            url: serverUrl + 'players/' + generatedUsername.toString().replace(' ', '-'),
            responseType: 'text'
        })
        .then(response => {
            if(response.data === "ok" && this.state.newUserBttnClicked){

                //to create a room id collection and update the rooomid field of current player's row in Rooms collections 
                // it will return a promise (axios is promise-based)
                return axios({
                    method: 'post',
                    url: serverUrl + 'rooms/create-or-update/' + roomid,
                    data: {
                        roomid: roomid,
                        admin: generatedUsername,
                        timeCreated: Date.now(),
                        numberOfPlayers: 1,
                        players: generatedUsername,
                        status: 'open',
                        currentRoles: currentRoles,
                        recommendedRoles: recommendedRoles
                    }
                })
            }

            else{
                this.setState(
                {
                    newRoomBttnClicked  : false
                })
            }
        })
        .then(response => {
            if(response.data === "ok"){
                this.setState(
                {
                    newRoomBttnClicked  : true
                })

                axios({
                    method: 'get',
                    url: serverUrl + 'handle-cookies',
                    params: {
                        roomid: roomid,
                        username: generatedUsername
                    } 
                })
                .then(res => {
                    cookies.set(res.data.username, res.data.roomid, { path: '/' })
                    if(cookies.get(res.data.username))
                        this.props.history.push(`/waiting-room/` + roomid + `/` + generatedUsername)
                })
                .catch(err => console.log(err))
            }

            else{
                this.setState(
                {
                    newRoomBttnClicked  : false
                })
            }
        })
        .catch(err => {
            console.log(err)
        })
    }



    joinButton = () => {
        if(this.state.newUserBttnClicked){
            if(insertedRoomid.length > 0){
                //to verify that the inserted room id and player's username exist    
                let requests = [{
                    method: 'get',
                    url: serverUrl + 'rooms/' + insertedRoomid
                }, 
                {
                    method: 'get',
                    url: serverUrl + 'players/' + generatedUsername.toString().replace(' ', '-')
                },
                {
                    method: 'get',
                    url: serverUrl + 'handle-cookies',
                    params: {
                        roomid: insertedRoomid,
                        username: generatedUsername
                    }
                }]
                
                axios.all([
                    axios.request(requests[0]).catch(err => console.log(err)),
                    axios.request(requests[1]).catch(err => console.log(err)),
                    axios.request(requests[2]).catch(err => console.log(err))
                ])
                .then(axios.spread((res1, res2, res3) => {
                    //if responses from above 2 GET are both "ok" and the player have successfully created a username, then proceed
                    if(res1.data === "ok" && res2.data === "ok"){
                        let requests = [{  
                            //Update the username into the room document
                            method: 'post',
                            url: serverUrl + 'rooms/' + insertedRoomid + '/update',
                            data: {
                                roomid: insertedRoomid,
                                username: generatedUsername
                            }
                        }, 
                        {
                            //Update the roomid into the username document
                            method: 'post',
                            url: serverUrl + 'players/' + generatedUsername.toString().replace(' ', '-') + '/update',
                            data: {
                                roomid: insertedRoomid,
                                username: generatedUsername
                            }
                        }]

                        axios(requests[0])
                        .then(response => {
                            if(response.data === "ok")
                                return axios(requests[1])
                        })
                        .then(response => {
                            if(response.data === "ok"){
                                cookies.set(res3.data.username, res3.data.roomid, { path: '/' })
                                if(cookies.get(res3.data.username))
                                    this.props.history.push(`/waiting-room/` + insertedRoomid + `/`  + generatedUsername)
                            }

                            else{
                                this.DisplayWarningIconForRoomId()

                                document.getElementById("warning-roomid").innerText = "Unknown Error"
                            }
                        })
                        .catch(err => {
                            this.DisplayWarningIconForRoomId()

                            document.getElementById("warning-roomid").innerText = err
                        })
                    }


                    //If there is not existing inserted roomid
                    else{
                        this.DisplayWarningIconForRoomId()

                        document.getElementById("warning-roomid").innerText = "Room ID doesn't exist"
                    }
                }))
                .catch(err => {
                    this.DisplayWarningIconForRoomId()

                    document.getElementById("warning-roomid").innerText = err
                })
            }

            //the roomid input field is blank
            else{
                this.DisplayWarningIconForRoomId()

                document.getElementById("warning-roomid").innerText = "This field can't be blank"
            }
        }
        
        else{
            document.getElementById("warning-username").innerText = "You need a name"
            this.DisplayWarningIconForUsername()
        }
    }

    DisplayWarningIconForRoomId = () => {
        //Make certain that both warning and approve icons for roomid are invisible
        document.getElementById("warning-icon-for-roomid").classList.add("icon-display-invisible")
        document.getElementById("approve-icon-for-roomid").classList.add("icon-display-invisible")

        //Remove the invisible class to make the warning icon visible
        document.getElementById("warning-icon-for-roomid").classList.remove("icon-display-invisible")
    }

    DisplayApproveIconForRoomId = () => {
        //Make certain that both warning and approve icons for roomid are invisible
        document.getElementById("warning-icon-for-roomid").classList.add("icon-display-invisible")
        document.getElementById("approve-icon-for-roomid").classList.add("icon-display-invisible")

        //Remove the invisible class to make the approve icon visible
        document.getElementById("approve-icon-for-roomid").classList.remove("icon-display-invisible")
    }

    componentDidMount(){
        document.getElementById("header").classList.remove("hide-header")
        document.getElementById("header").classList.add("hide-header")
    }

    componentDidUpdate(prevProps, prevState){
        //Icon displaying for username input field
        if(this.state.newUserBttnClicked){
            generatedUsername = this.state.username

            this.DisplayApproveIconForUsername()
        }
    }

    render(){
        return(
            <div className="Login-page-cover">
                <div className="Login-page-title">
                    <h2>Login Room</h2>
                </div>

                <div className="Login-page-body">
                    <input type="text" name="player_username" onChange={e => {
                        this.setState({username: e.target.value})
                        document.getElementById("warning-username").innerText = ""}} placeholder="Enter an username"/>
                    <button className="button-of-Login" type="button" onClick={this.newUserButton}>create</button>


                    <div className="input-overlay">
                        <i id="warning-icon-for-username" className="fas fa-exclamation-triangle warning-mark icon-display-invisible"></i>
                        <i id="approve-icon-for-username" className="fas fa-check checkmark icon-display-invisible"></i>
                    </div>

                    <div className="warning-holder">
                        <p id="warning-username"></p>
                    </div>

                    <br></br>

                    <input type="text" name="player_roomid" id="player_roomid" onChange={e => {
                        insertedRoomid = e.target.value
                        document.getElementById("warning-roomid").innerText = ""}} placeholder="Room ID"/>
                    <button className="button-of-Login" type="button" onClick={this.joinButton}>join</button>

                    <div className="input-overlay input-overlay-roomid" id="warning-for-roomid">
                        <i id="warning-icon-for-roomid" className="fas fa-exclamation-triangle warning-mark icon-display-invisible"></i>
                        <i id="approve-icon-for-roomid" className="fas fa-check checkmark icon-display-invisible"></i>
                    </div>

                    <div className="warning-holder">
                        <p id="warning-roomid"></p>
                        {/* <p>Room ID doesn't exist</p> */}
                    </div>

                    <br></br>

                    <button className="button-of-Login create-new-room-button" type="button" onClick={this.newRoomButton}>Create a Room and Go</button>
                </div>
            </div>
        )
    }
}

export default Login