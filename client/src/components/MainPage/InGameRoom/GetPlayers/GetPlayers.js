import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'

const serverUrl = 'http://localhost:3001/'


class GetPlayers extends Component{
    state = {
        renderPlayers: null
    }

    playerBttn = (name, e) => {
        console.log(name)
    }

    componentDidMount(){
        const getPlayerSocket = socketIOClient(serverUrl + 'main-page', {
            query: {
                roomid : this.props.roomid
            }
        } )
        getPlayerSocket.on('GetPlayersAt' + this.props.roomid, data => {this.setState({
            renderPlayers: data.map(player => {
                if(player !== this.props.username){
                    return(
                        <div key = {player}>
                            <button type="button" onClick={this.playerBttn.bind(this, player)}>{player}</button>
                        </div>
                    )
                }

                return <></>
            })
        })})
    }

    render(){
        return(
            <>
                {this.state.renderPlayers}
            </>
        )
    }
}

export default GetPlayers