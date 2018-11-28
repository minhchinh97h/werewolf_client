import React, { Component } from 'react'

import socketIOClient from 'socket.io-client'
import chosenCards from '../../../../local-data-holder/cardArray'

const serverUrl = 'http://192.168.1.3:3001/'

class DisplayCards extends Component {
    state = {
        renderCards: null,
        admin: ''
    }

    chooseCardBttn = (name, e) => {
        chosenCards.push(name)
    }

    componentDidMount(){
        const socket = socketIOClient(serverUrl + 'get-admin', {
            query: {
                roomid: this.props.roomid
            }
        })

        socket.on('GetAdminAt' + this.props.roomid, data => {
            if(this.props.username === data.admin){
                const cardSocket = socketIOClient(serverUrl + 'get-cards')
                cardSocket.on('GetCards', data => {
                    this.setState({
                        renderCards: data.map( (card, index) => {
                            let cardId = "card " + index
                            return(
                                <div key = {card.name}>
                                    <button type='button' onClick={this.chooseCardBttn.bind(this, card.name)} id={cardId}>{card.name}</button>
                                </div>
                            )
                        })
                    })
                })
            }
        })

        
    }
    
    render(){
        return(
            <>
                {this.state.renderCards}
            </>
        )
    }
}


export default DisplayCards