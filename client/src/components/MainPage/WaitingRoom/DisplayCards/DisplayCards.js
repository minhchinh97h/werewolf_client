import React, { Component } from 'react'

import socketIOClient from 'socket.io-client'
import currentRoles from '../../../../validation/currentRoles/currentRoles'
import serverUrl from '../../../../serverUrl'

import "./DisplayCards.css"

class DisplayCards extends Component {
    _isMounted = false

    state = {
        renderCards: null,
        renderPressedCards: null,
        isCardSelected: false,
        selectedCards: null,
        pressedCards: null,
        currentRoles: null
    }

    //Used to leave one card out of the current chosen card collection
    decreaseCardBttn = (name, e) => {
        currentRoles[name] -= 1
        
        if(currentRoles[name] < 0 || currentRoles[name] === 0){
            currentRoles[name] = 0
            document.getElementById(name + "-quantity").innerText = ""
        }
        let name_array = [],
            value_array = []

        for(var key in currentRoles){
            if(currentRoles.hasOwnProperty(key))
            {
                if(currentRoles[key] > 0){
                    name_array.push(key)
                    value_array.push(currentRoles[key])
                }
                    
            }
        }
        
        name_array.forEach((name, index) => {
            let quantityId = name + "-quantity"
            
            if(value_array[index] === 0)
                document.getElementById(quantityId).innerText = ""
            else
                document.getElementById(quantityId).innerText = "x" + value_array[index]
        })

        this.setState({
            isCardSelected: true
        })
    }

    //Used to choose a card and add it to the chosen card collection
    chooseCardBttn = (name, e) => {
        currentRoles[name] += 1
        
        let name_array = [],
            value_array = []

        for(var key in currentRoles){
            if(currentRoles.hasOwnProperty(key))
            {
                if(currentRoles[key] > 0){
                    name_array.push(key)
                    value_array.push(currentRoles[key])
                }
                    
            }
        }
        
        name_array.forEach((name, index) => {
            let quantityId = name + "-quantity"

            document.getElementById(quantityId).innerText = "x" + value_array[index]
        })

        this.setState({
            isCardSelected: true
        })
    }

    //Used to submit the card collection to database
    submitCardsBttn = (e) => {
        let sentData = {
            roomid: this.props.roomid,
            currentRoles: currentRoles
        }

        const socket = socketIOClient(serverUrl + 'submit-selected-cards')

        socket.on('connect', () => {
            socket.emit('JoinRoom', sentData)
        })
    }

    componentDidMount(){
        this._isMounted = true

        if(this._isMounted){

            const cardSocket = socketIOClient(serverUrl + 'get-cards')

            cardSocket.on('GetCards', data => {
                this.setState({
                    renderCards: data.map( (card, index) => {
                        let cardId = "card " + index,
                            quantityId = card.name + "-quantity"
                        return(
                            <div key = {card.name} className="card-item">
                                <button className ="card-button" type='button' onClick={this.chooseCardBttn.bind(this, card.name)} id={cardId}>{card.name}</button>
                                <div className="card-quantity-holder">
                                    <p id={quantityId}></p>
                                </div> 
                                <i className="fas fa-minus-square minus-sign fa-sm" onClick={this.decreaseCardBttn.bind(this, card.name)}></i>
                            </div>
                        )
                    })
                })

                //To make sure DOM elements (card-item) show up when below socket's data arrives.
                const socket = socketIOClient(serverUrl + 'get-current-roles')

                socket.on('connect', () => {
                    socket.emit('JoinRoom', this.props.roomid)
                })

                socket.on('GetSelectedCards', data => {
                    
                    if(data !== null && this._isMounted){
                        for(var key in data){
                            if(data.hasOwnProperty(key)){
                                currentRoles[key] = data[key]
                            }
                        }

                        let name_array = [],
                        value_array = []

                        for(var k in currentRoles){
                            if(currentRoles.hasOwnProperty(k))
                            {
                                if(currentRoles[k] > 0){
                                    name_array.push(k)
                                    value_array.push(currentRoles[k])
                                }
                                    
                            }
                        }
                        
                        name_array.forEach((name, index) => {
                            let quantityId = name + "-quantity"
                
                            document.getElementById(quantityId).innerText = "x" + value_array[index]
                        })

                    }
                
                })
            })

                
        }
    }
    
    componentWillUnmount(){
        this._isMounted = false
    }

    render(){
        return(
            <>
            <div className="admin-choose-cards-and-submit-button-container" id="display-cards-container">
                <div className = "display-cards-container">
                    {this.state.renderCards}
                    
                    
                </div>
                <div className="submit-card-collection-button-holder">
                        {this.state.isCardSelected ?

                                <button type="button" onClick={this.submitCardsBttn.bind(this)}>submit</button>
                                :
                                null
                        }
                </div>
            </div>
            
            </>
        )
    }
}


export default DisplayCards