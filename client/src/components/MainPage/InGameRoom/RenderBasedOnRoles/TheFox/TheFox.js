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


         //Handle the first round
         const socket = socketIOClient(serverUrl + 'in-game')

         socket.on('connect', () => {
             socket.emit('JoinRoom', this.props.roomid)
         })
 
         //after the timer counts to 0, have to inform players that Round 1 will start soon
         let currentSecond = 10
 
         socket.on('RetrieveGameStart1stRound', data => {
             // if(data === 'ok'){
             //     let timer = setInterval(() => {
             //         currentSecond--
 
             //         if(currentSecond < 0){
            socket.emit('RequestToGet1stTurn', this.props.roomid)
             //             clearInterval(timer)
             //         }
             //     }, 1000)
             // }
         })
 
         //Retrieve the 1st turn, if the player is the first to be called, then render its ui
         socket.on('Retrieve1stTurn', data => {
             if(data === this.props.username){
                 this.setState({
                     renderUI: <>
                         <div>
                             <p>Who do you want to reveal?</p>
                         </div>
                     </>
                 })
 
                 //Seer's action
                 const seerSocket = socketIOClient(serverUrl + 'seer')
 
                 seerSocket.on('RevealPlayer', (data) => {
                     this.setState({
                         renderTargetRole: <b>The target's role is: {data}</b>,
                         endTurnConfirm: <button type="button" onClick={this.endTurnBttn}>End turn</button>
                     })
                 })
             }
         })
 


        //Handle the called turn 
        const calledTurnSocket = socketIOClient(serverUrl + 'retrieve-next-turn')

        calledTurnSocket.on('getNextTurn', data => {
            console.log(data)
            if(data.name === this.props.username){
                this.setState({
                    renderUI: <>
                        <div>
                            <p>Who do you want to reveal?</p>
                        </div>
                    </>
                })
    
                //Seer's action
                const seerSocket = socketIOClient(serverUrl + 'seer')
    
                seerSocket.on('RevealPlayer', (data) => {
                    this.setState({
                        renderTargetRole: <b>The target's role is: {data}</b>,
                        endTurnConfirm: <button type="button" onClick={this.endTurnBttn}>End turn</button>
                    })
                })
            }
        })

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