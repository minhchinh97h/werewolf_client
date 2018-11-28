import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'
import rolesLimit from '../../../../../validation/number-of-cards-depending-on-number-of-players/numberOfCards'

const serverUrl = 'http://192.168.1.3:3001/'

class NumberOfPlayers extends Component{

    state = {

    }

    componentDidMount(){

        //the limit of roles depend on the number of players, so whenever a player connects to the room, run socketIOClient to update the relevant info 
        //in the rooms database

        switch (this.props.numberOfPlayers) {
            case 8:
                for(var key in rolesLimit){
                    if(rolesLimit.hasOwnProperty(key)){
                        if(key !== 'Werewolves' && key !== 'Ordinary Townsfolk')
                            rolesLimit[key] = 1
                        else if(key === 'Werewolves')
                            rolesLimit[key] = 2
                        else
                            rolesLimit[key] = 5
                    }
                }
                break
            
            case 9:
                for(var key in rolesLimit){
                    if(rolesLimit.hasOwnProperty(key)){
                        if(key !== 'Werewolves' && key !== 'Ordinary Townsfolk')
                            rolesLimit[key] = 1
                        else if(key === 'Werewolves')
                            rolesLimit[key] = 2
                        else
                            rolesLimit[key] = 6
                    }
                }
                break

            case 10:
                for(var key in rolesLimit){
                    if(rolesLimit.hasOwnProperty(key)){
                        if(key !== 'Werewolves' && key !== 'Ordinary Townsfolk')
                            rolesLimit[key] = 1
                        else if(key === 'Werewolves')
                            rolesLimit[key] = 2
                        else
                            rolesLimit[key] = 7
                    }
                }
                break
            
            case 11:
                for(var key in rolesLimit){
                    if(rolesLimit.hasOwnProperty(key)){
                        if(key !== 'Werewolves' && key !== 'Ordinary Townsfolk')
                            rolesLimit[key] = 1
                        else if(key === 'Werewolves')
                            rolesLimit[key] = 2
                        else
                            rolesLimit[key] = 8
                    }
                }
                break

            case 12:
                for(var key in rolesLimit){
                    if(rolesLimit.hasOwnProperty(key)){
                        if(key !== 'Werewolves' && key !== 'Ordinary Townsfolk')
                            rolesLimit[key] = 1
                        else if(key === 'Werewolves')
                            rolesLimit[key] = 3
                        else
                            rolesLimit[key] = 8
                    }
                }
                break

            case 13:
                for(var key in rolesLimit){
                    if(rolesLimit.hasOwnProperty(key)){
                        if(key !== 'Werewolves' && key !== 'Ordinary Townsfolk')
                            rolesLimit[key] = 1
                        else if(key === 'Werewolves')
                            rolesLimit[key] = 3
                        else
                            rolesLimit[key] = 9
                    }
                }
                break

            case 14:
                for(var key in rolesLimit){
                    if(rolesLimit.hasOwnProperty(key)){
                        if(key !== 'Werewolves' && key !== 'Ordinary Townsfolk')
                            rolesLimit[key] = 1
                        else if(key === 'Werewolves')
                            rolesLimit[key] = 3
                        else
                            rolesLimit[key] = 10
                    }
                }
                break

            case 15:
                for(var key in rolesLimit){
                    if(rolesLimit.hasOwnProperty(key)){
                        if(key !== 'Werewolves' && key !== 'Ordinary Townsfolk')
                            rolesLimit[key] = 1
                        else if(key === 'Werewolves')
                            rolesLimit[key] = 3
                        else
                            rolesLimit[key] = 11
                    }
                }
                break

            case 16:
                for(var key in rolesLimit){
                    if(rolesLimit.hasOwnProperty(key)){
                        if(key !== 'Werewolves' && key !== 'Ordinary Townsfolk')
                            rolesLimit[key] = 1
                        else if(key === 'Werewolves')
                            rolesLimit[key] = 3
                        else
                            rolesLimit[key] = 12
                    }
                }
                break

            case 17:
                for(var key in rolesLimit){
                    if(rolesLimit.hasOwnProperty(key)){
                        if(key !== 'Werewolves' && key !== 'Ordinary Townsfolk')
                            rolesLimit[key] = 1
                        else if(key === 'Werewolves')
                            rolesLimit[key] = 3
                        else
                            rolesLimit[key] = 13
                    }
                }
                break

            case 18:
                for(var key in rolesLimit){
                    if(rolesLimit.hasOwnProperty(key)){
                        if(key !== 'Werewolves' && key !== 'Ordinary Townsfolk')
                            rolesLimit[key] = 1
                        else if(key === 'Werewolves')
                            rolesLimit[key] = 3
                        else
                            rolesLimit[key] = 14
                    }
                }
                break

            default:
                for(var key in rolesLimit){
                    if(rolesLimit.hasOwnProperty(key)){
                        if(key !== 'Werewolves' && key !== 'Ordinary Townsfolk')
                            rolesLimit[key] = 1
                        else if(key === 'Werewolves')
                            rolesLimit[key] = 1
                        else
                            rolesLimit[key] = 4
                    }
                }
        }

        let sentData = {
            roomid: this.props.roomid,
            rolesLimit: rolesLimit
        }

        const socket = socketIOClient(serverUrl + 'update-roles-limit')
        socket.on('connect', () => {
            socket.emit('JoinRoom', sentData)
        })

        socket.on('UpdateRolesLimitAt', data => {
            console.log(data)
        })
    }



    componentDidUpdate(prevProps, prevState){
        if(this.props.numberOfPlayers !== prevProps.numberOfPlayers){
            
            
        }
    }


    render(){
        return(
            <>
                <p>{this.props.numberOfPlayers}</p>
            </>
        )
    }
}

export default NumberOfPlayers