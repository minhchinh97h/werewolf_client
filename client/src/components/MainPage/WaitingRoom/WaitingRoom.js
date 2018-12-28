import React, { Component } from 'react'

import DisplayPlayerNames from './DisplayPlayerNames/DisplayPlayerNames'
import DisplayCards from './DisplayCards/DisplayCards'
import DisplayChosenCards from './DisplayChosenCards/DisplayChosenCards'
import UpdateRecommendedRoles from './UpdateRecommendedRoles/UpdateRecommendedRoles'

import NavBar from './NavBar/NavBar'

import socketIOClient from 'socket.io-client'

const serverUrl = 'http://localhost:3001/'


class WaitingRoom extends Component{
    _isMounted = false

    state = {
        ifAdmin: false,
        admin: "",
        numberOfPlayers: 0,
        ifStartGame: false
    }

    componentDidMount(){
        this._isMounted = true

        const socket = socketIOClient(serverUrl + 'get-admin', {
            query: {
                roomid: this.props.match.params.roomid
            }
        })

        socket.on('connect', () => {
            socket.emit('JoinRoom', this.props.match.params.roomid)
        })

        socket.on('GetAdmin', data => {
            if(this._isMounted){
                this.setState({
                    admin: data.admin,
                    numberOfPlayers: data.numberOfPlayers
                })
    
                if(this.props.match.params.username === data.admin){
                    this.setState({
                        ifAdmin: true
                    })
                }
                else{
                    this.setState({
                        ifAdmin: false
                    })
                }
            }
        })

        const startGameSocket = socketIOClient(serverUrl + 'start-game')

        startGameSocket.on('connect', () => {
            startGameSocket.emit('JoinRoom', this.props.match.params.roomid)
        })
        
        startGameSocket.on('RedirectToGameRoom', data => {
            if(data === "ok" && this._isMounted)
                this.props.history.push('/in-game-room/' + this.props.match.params.roomid + '/' + this.props.match.params.username)
        })
    }

    componentWillUnmount(){
        this._isMounted = false
    }
    
    componentDidUpdate(prevProps, prevState){
        if(this.state.ifStartGame !== prevState.ifStartGame && this.state.ifStartGame){
            
        }
    }

    render(){
        return(
            <div>
                <br></br>
                <div className = "display-player-names">
                    <DisplayPlayerNames roomid = {this.props.match.params.roomid} />
                </div>
                {this.state.ifAdmin?
                    <div className = "display-cards">
                        <DisplayCards roomid = {this.props.match.params.roomid}
                                    admin = {this.state.admin}
                                    username = {this.props.match.params.username}
                                    test = {this.state.test}
                                    ifAdmin = {this.state.ifAdmin}
                        />
                    </div>
                    :
                    null
                }
                
                <div className = "display-chosen-cards-section">
                    <b>Current Chosen Cards</b>
                    <DisplayChosenCards roomid = {this.props.match.params.roomid} />
                </div>

                {/* below component will not render anything */}
                <div className = "display-recommended-roles-section">
                    <UpdateRecommendedRoles numberOfPlayers = {this.state.numberOfPlayers} roomid = {this.props.match.params.roomid} />
                </div>

                <div className = "navbar">
                    <NavBar roomid = {this.props.match.params.roomid} 
                            ifAdmin= {this.state.ifAdmin} 
                            numberOfPlayers = {this.state.numberOfPlayers} 
                            admin = {this.state.admin}
                            username = {this.props.match.params.username} 
                    />
                </div>
            </div>
        ) 
    }
}

export default WaitingRoom