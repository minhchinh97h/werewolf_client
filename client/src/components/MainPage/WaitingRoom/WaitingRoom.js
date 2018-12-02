import React, { Component } from 'react'

import DisplayPlayerNames from './DisplayPlayerNames/DisplayPlayerNames'
import DisplayCards from './DisplayCards/DisplayCards'
import DisplayChosenCards from './DisplayChosenCards/DisplayChosenCards'
import UpdateRecommendedRoles from './UpdateRecommendedRoles/UpdateRecommendedRoles'

import NavBar from './NavBar/NavBar'

import socketIOClient from 'socket.io-client'

const serverUrl = 'http://192.168.1.3:3001/'


class WaitingRoom extends Component{

    state = {
        ifAdmin: false,
        admin: "",
        numberOfPlayers: 0
    }

    componentDidMount(){
        const socket = socketIOClient(serverUrl + 'get-admin', {
            query: {
                roomid: this.props.roomid
            }
        })

        socket.on('connect', () => {
            socket.emit('JoinRoom', this.props.roomid)
        })

        socket.on('GetAdmin', data => {
            this.setState({
                admin: data.admin,
                numberOfPlayers: data.numberOfPlayers
            })

            if(this.props.username === data.admin){
                this.setState({
                    ifAdmin: true
                })
            }
            else{
                this.setState({
                    ifAdmin: false
                })
            }
        })
    }

    componentDidUpdate(prevProps, prevState){
    }

    render(){
        return(
            <div>
                <br></br>
                <div className = "display-player-names">
                    <DisplayPlayerNames roomid = {this.props.roomid} />
                </div>
                {this.state.ifAdmin?
                    <div className = "display-cards">
                        <DisplayCards roomid = {this.props.roomid}
                                    admin = {this.state.admin}
                                    username = {this.props.username}
                                    test = {this.state.test}
                                    ifAdmin = {this.state.ifAdmin}
                        />
                    </div>
                    :
                    null
                }
                
                <div className = "display-chosen-cards-section">
                    <b>Current Chosen Cards</b>
                    <DisplayChosenCards roomid = {this.props.roomid} />
                </div>

                {/* below component will not render anything */}
                <div className = "display-recommended-roles-section">
                    <UpdateRecommendedRoles numberOfPlayers = {this.state.numberOfPlayers} roomid = {this.props.roomid} />
                </div>

                <div className = "navbar">
                    <NavBar roomid = {this.props.roomid} 
                            ifAdmin= {this.state.ifAdmin} 
                            numberOfPlayers = {this.state.numberOfPlayers} 
                            admin = {this.state.admin} 
                    />
                </div>
            </div>
        ) 
    }
}

export default WaitingRoom