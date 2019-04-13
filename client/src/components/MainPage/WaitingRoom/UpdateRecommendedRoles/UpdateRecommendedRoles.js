import React from 'react'
import socketIOClient from 'socket.io-client'
import recommendedRoles from '../../../../validation/recommendedRoles/recommendedRoles'

import serverUrl from '../../../../serverUrl'

let UpdateRolesLimitSocket

class UpdateRecommendedRoles extends React.Component{
    _isMounted = false

    state = {
        renderRecommendedRoles: null
    }

    componentDidMount(){
        this._isMounted = true
        
        
    }

    componentWillUnmount(){
        this._isMounted = false
    }

    componentDidUpdate(prevProps, prevState){
        //to confirm that the room gets more player in order to re-render the roles limit
        if(this.props.numberOfPlayers !== prevProps.numberOfPlayers){
            
            recommendedRoles['totalCards'] = this.props.numberOfPlayers + 3
            //the limit of roles depend on the number of players, so whenever a player connects to the room, run socketIOClient to update the relevant info 
            //in the rooms database
            switch (this.props.numberOfPlayers) {
                case 8:
                    recommendedRoles['Werewolves'] = 2
                    
                    break
                
                case 9:
                    recommendedRoles['Werewolves'] = 2

                    break
    
                case 10:
                    recommendedRoles['Werewolves'] = 2

                    break
                
                case 11:
                    recommendedRoles['Werewolves'] = 2

                    break
    
                case 12:
                    recommendedRoles['Werewolves'] = 3

                    break
    
                case 13:
                    recommendedRoles['Werewolves'] = 3

                    break   
    
                case 14:
                    recommendedRoles['Werewolves'] = 3

                    break 
    
                case 15:
                    recommendedRoles['Werewolves'] = 3

                    break 
    
                case 16:
                    recommendedRoles['Werewolves'] = 3

                    break 
    
                case 17:
                    recommendedRoles['Werewolves'] = 3

                    break 
    
                case 18:
                    recommendedRoles['Werewolves'] = 3

                    break 
    
                default:
                    recommendedRoles['Werewolves'] = 1
            }

            let sentData = {
                roomid: this.props.roomid,
                rolesLimit: recommendedRoles
            }
    
            UpdateRolesLimitSocket = socketIOClient(serverUrl + 'update-roles-limit')
            UpdateRolesLimitSocket.on('connect', () => {
                UpdateRolesLimitSocket.emit('JoinRoom', sentData)
            })
    
            UpdateRolesLimitSocket.on('UpdateRolesLimitAt', data => {
                if(this._isMounted){
                    let roles = []
                    for(var key in data.recommendedRoles){
                        if(data.recommendedRoles.hasOwnProperty(key)){
                            roles.push(key + ': ' + data.recommendedRoles[key])
                        }
                    }
                }
            })
        }
    }

    render(){
        return(
            <>
            </>
        )
    }
}

export {UpdateRecommendedRoles, UpdateRolesLimitSocket}