import React, { Component } from 'react'

import socketIOClient from 'socket.io-client'
import chosenCards from '../../../../local-data-holder/cardArray'

import ControlChosenCards from './ControlChosenCards/ControlChosenCards'

const serverUrl = 'http://192.168.1.3:3001/'


let pressedCards = {}


class DisplayCards extends Component {
    state = {
        renderCards: null,
        renderPressedCards: null
    }

    chooseCardBttn = (name, e) => {

        // if(pressedCards === {})
        //     console.log( true )

        // for(var key in pressedCards){
        //     if(pressedCards.hasOwnProperty(key)){
        //         if(key === name || key.Equals(name)){
        //             pressedCards[key] += 1
        //         }
        //     }
        //     else{
        //         pressedCards[name] = 1
        //     }
        // }
        let renderCards = []
        
        if(pressedCards[name] === undefined){
            pressedCards[name] = 1
        }
        else
            pressedCards[name] += 1

        for(var key in pressedCards){
            if(pressedCards.hasOwnProperty(key))
                renderCards.push(key + ' has ' + pressedCards[key] + ' characters')
        }
        
        
        this.setState({
            renderPressedCards: renderCards.map((row, index) => {return(<p key={index}>{row}</p>)})
        })
    }

    componentDidMount(){
        
    }
    
    componentDidUpdate(prevProps, prevState){
        if(this.props.admin !== prevProps.admin){
            if(this.props.username === this.props.admin){
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
        }
    }

    render(){
        return(
            <>
                {this.state.renderCards}

                <div className = "display-chosen-cards">    
                    <b>Current Chosen Cards Panel:</b>
                    {this.state.renderPressedCards}
                </div>
                <br></br>
                <div className = "control-chosen-cards">
                    <b>Control Chosen Cards Panel:</b>
                    <ControlChosenCards roomid = {this.props.roomid} />
                </div>
            </>
        )
    }
}


export default DisplayCards