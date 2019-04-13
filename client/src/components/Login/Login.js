import React, { Component } from 'react'

import currentRoles from '../../validation/currentRoles/currentRoles'

import serverUrl from '../../serverUrl'
import "./Login.css"

const uniqid = require('uniqid')
const axios = require('axios')

class Login extends Component{

    state={}

    newRoomButton = () => {
        let roomid = uniqid()

        let input_player_username_node = document.getElementById("input_player_username")

        if(input_player_username_node.value.length === 0){
            input_player_username_node.placeholder = "Please enter a name"
        }

        else{
            //Create a player with the input name in players collection and also a room with updated players info
            axios({
                method: 'post',
                url: serverUrl + 'rooms/' + roomid + '/create-player-and-room',
                data: {
                    roomid: roomid,
                    username: input_player_username_node.value,
                    currentRoles: currentRoles
                }
            })
            .then(res => {
                if(res.data === "ok"){
                    this.props.history.push(`/waiting-room/` + roomid + `/` + input_player_username_node.value)
                }
            })
            .catch(err => console.log(err))
        }
    }


    joinButton = () => {
        let input_player_username_node = document.getElementById("input_player_username"),
            input_player_roomid_node = document.getElementById("input_player_roomid")

        if(input_player_username_node.value.length === 0){
            input_player_username_node.placeholder = "Please enter a name"

            if(input_player_roomid_node.value.length === 0){
                input_player_roomid_node.placeholder = "Please enter a valid room Id"
            }
        }

        else{
            if(input_player_roomid_node.value.length === 0){
                input_player_roomid_node.placeholder = "Please enter a valid room Id"
            }

            else{
                //Check whether the room exists and whether the room contains the name
                axios({
                    method: 'post',
                    url: serverUrl + 'rooms/' + input_player_roomid_node.value + '/get-room-check-username',
                    data: {
                        roomid: input_player_roomid_node.value,
                        username: input_player_username_node.value
                    }
                })
                .then(res => {
                    if(res.data === "ok"){
                        this.props.history.push(`/waiting-room/` + input_player_roomid_node.value + `/`  + input_player_username_node.value)
                    }

                    else if (res.data === "username exists"){
                        input_player_username_node.placeholder = "'" + input_player_username_node.value + "' already exists in " + input_player_roomid_node.value
                        input_player_username_node.value = ""
                    }

                    else {
                        input_player_roomid_node.placeholder = "'" + input_player_roomid_node.value + "' doesn't exist"
                        input_player_roomid_node.value = ""
                    }
                })
                .catch(err => console.log(err))
            }
        }
    }

    componentDidMount(){
    }

    componentDidUpdate(prevProps, prevState){
    }

    componentWillUnmount(){
    }

    render(){
        return(
            <div className="Login-page-cover">
                <div className="Login-page-title">
                    <h2>Login Room</h2>
                </div>

                <div className="Login-page-body">

                    <input type="text" id="input_player_username" name="player_username" placeholder="Name"/>

                    <input type="text" id="input_player_roomid" name="player_roomid" placeholder="Room ID"/>

                    <button className="button-of-Login" type="button" onClick={this.joinButton}>join</button>

                    <button className="button-of-Login create-new-room-button" type="button" onClick={this.newRoomButton}>Create a Room and Go</button>
                </div>
            </div>
        )
    }
}

export default Login