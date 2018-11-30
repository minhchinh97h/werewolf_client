import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'
import rolesLimit from '../../../../validation/number-of-cards-depending-on-number-of-players/numberOfCards'

const serverUrl = 'http://192.168.1.3:3001/'

class DisplayRecommendedRoles extends Component{
    state = {
        renderRecommendedRoles: null
    }

    componentDidMount(){
        
        
    }

    componentDidUpdate(prevProps, prevState){
        //to confirm that the room gets more player in order to re-render the roles limit
        if(this.props.numberOfPlayers != prevProps.numberOfPlayers){
            
            rolesLimit['totalCards'] = this.props.numberOfPlayers + 3
            //the limit of roles depend on the number of players, so whenever a player connects to the room, run socketIOClient to update the relevant info 
            //in the rooms database
            switch (this.props.numberOfPlayers) {
                case 8:
                    rolesLimit['Werewolves'] = 2
                    
                    break
                
                case 9:
                    rolesLimit['Werewolves'] = 2

                    break
    
                case 10:
                    rolesLimit['Werewolves'] = 2

                    break
                
                case 11:
                    rolesLimit['Werewolves'] = 2

                    break
    
                case 12:
                    rolesLimit['Werewolves'] = 3

                    break
    
                case 13:
                    rolesLimit['Werewolves'] = 3

                    break   
    
                case 14:
                    rolesLimit['Werewolves'] = 3

                    break 
    
                case 15:
                    rolesLimit['Werewolves'] = 3

                    break 
    
                case 16:
                    rolesLimit['Werewolves'] = 3

                    break 
    
                case 17:
                    rolesLimit['Werewolves'] = 3

                    break 
    
                case 18:
                    rolesLimit['Werewolves'] = 3

                    break 
    
                default:
                    rolesLimit['Werewolves'] = 1
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
                let roles = []
                for(var key in data.recommendedRoles){
                    if(data.recommendedRoles.hasOwnProperty(key)){
                        roles.push(key + ': ' + data.recommendedRoles[key])
                    }
                }
    
                this.setState({
                    renderRecommendedRoles: roles.map(data => {return(<p key={data}>{data}</p>)})
                })
                
            })
        }
    }

    render(){
        return(
            <>
                <br></br>
                <b>Display recommended roles</b>
                {this.state.renderRecommendedRoles}
            </>
        )
    }
}

export default DisplayRecommendedRoles