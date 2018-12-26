import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'


const serverUrl = 'http://localhost:3001/'

class TheFox extends Component{

    state = {
        renderUI: null,
        renderPlayers: null
    }

    componentDidMount(){
        // to display all the players that are from the room
        const getPlayerSocket = socketIOClient(serverUrl + 'main-page', {
            query: {
                roomid : this.props.roomid
            }
        } )
        getPlayerSocket.on('GetPlayersAt' + this.props.roomid, data => {this.setState({
            renderPlayers: data.map((player, index) => {
                if(player !== this.props.username){

                    return(
                        <div key = {player}>
                            <button  type="button" onClick={this.playerToRevealBttn.bind(this, player)}>{player}</button>
                        </div>
                    )
                }
            })
        })})



    }

    render(){
        return(
            <>
                {this.state.renderUI}
                
                <br></br>

                {this.state.renderPlayers}
            </>
        )
    }
}   

export default TheFox