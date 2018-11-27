import React, { Component } from 'react'

import socketIOClient from 'socket.io-client'

const serverUrl = 'http://192.168.1.3:3001/'


let cards = []

class DisplayCards extends Component {
    state = {
        renderCards: null
    }

    hideCardBttn = (index, e) => {
        console.log(index)
    }

    componentDidMount(){
        const socket = socketIOClient(serverUrl + 'get-cards')

        socket.on('GetCards', data => {
            this.setState({
                renderCards: data.map( (card, index) => {
                    let cardId = "card " + index
                    return(
                        <div key = {card.cardName}>
                            <button type='button' onClick={this.hideCardBttn.bind(this, index)} id={cardId}>{card.cardName}</button>
                        </div>
                    )
                })
            })

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