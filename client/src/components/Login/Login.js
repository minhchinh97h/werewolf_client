import React, { Component } from 'react'
import Cookies from 'universal-cookie'

import rolesLimit from '../../validation/number-of-cards-depending-on-number-of-players/numberOfCards'

const uniqid = require('uniqid')
const axios = require('axios')
const cookies = new Cookies()
const serverUrl = 'http://192.168.1.3:3001/'

let insertedRoomid,
    generatedUsername = "",
    roomid



class Login extends Component{
    state={
        username: "",
        roomid: "",
        newUserBttnClicked: false,
        newRoomBttnClicked: false,
        joinBttnClicked: false,
        usernameExists: false
    }

    newUserButton = () => {
        if(this.state.username !== "" || this.state.username.length !== 0){
            //to insert a player row info in Player database
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
                    }
                }
            })
            .then(response => {
                if(response.data === "ok"){

                    this.setState({
                        newUserBttnClicked: true,
                        usernameExists: false
                    })
                }
                
                else{
                    this.setState({
                        usernameExists: true,
                        newUserBttnClicked: false
                    })
                }

            })
            .catch(err => {
                console.log(err)
            })
        }

        else{
            this.setState({
                newUserBttnClicked: false
            })
        }
    }

    newRoomButton = () => {
        roomid = uniqid()

        console.log(rolesLimit)
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
                        currentRoles: rolesLimit
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
            if(res1.data === "ok" && res2.data === "ok" && this.state.newUserBttnClicked){   
                let requests = [{
                    method: 'post',
                    url: serverUrl + 'rooms/' + insertedRoomid + '/update',
                    data: {
                        roomid: insertedRoomid,
                        username: generatedUsername
                    }
                }, 
                {
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
                })
                .catch(err => console.log(err))
            }
        }))
        .catch(err => console.log(err))
    }

    componentDidMount(){

    }

    componentDidUpdate(prevProps, prevState){
        if(this.state.newUserBttnClicked){
            generatedUsername = this.state.username
        }

    }

    render(){
        return(
            <div className="Login-page-cover">
                <div className="Login-page-title">
                    <h2>Login title</h2>
                </div>
                <div className="Login-page-body">
                    <label>username </label>
                    <input type="text" name="player_username" onChange={e => this.setState({username: e.target.value})}/>
                    <button type="button" onClick={this.newUserButton}>create new username</button>

                    {this.state.newUserBttnClicked ? 
                        <p>Username created successfully</p>
                        :
                        (
                            this.state.usernameExists ?
                                
                                <p>username already exists</p>

                                :

                                <p>please enter a name</p>
                        )   
                    }
                    <br></br>

                    <label>If you want to generate a new play room, click the following button </label>
                    <button type="button" onClick={this.newRoomButton}>create new room and go</button>

                    {this.state.newRoomBttnClicked ? 
                        <p>New room created, here is the room id: {this.state.roomid}</p>
                        :
                        null
                    }
                    <br></br>
                    <br></br>
                    <br></br>
                    <label>if you already have the generated room id, please type to join </label>
                    <input type="text" name="player_roomid" id="player_roomid" onChange={e => insertedRoomid = e.target.value}/>
                    <button type="button" onClick={this.joinButton}>join</button>
                </div>
            </div>
        )
    }
}

export default Login