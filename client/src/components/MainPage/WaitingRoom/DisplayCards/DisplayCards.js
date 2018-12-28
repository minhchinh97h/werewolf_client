import React, { Component } from 'react'

import socketIOClient from 'socket.io-client'
import currentRoles from '../../../../validation/currentRoles/currentRoles'

const serverUrl = 'http://localhost:3001/'



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

    decreaseCardBttn = (name, e) => {
        
        currentRoles[name] -= 1
        
        if(currentRoles[name] < 0)
            currentRoles[name] = 0
        
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
        
        this.setState({
            renderPressedCards: name_array.map((name, index) => {
                let key = 'pressed-card-' + index
                return(
                    <div key={key}>
                        <p>{name}: x{value_array[index]}</p>
                        <button type="button" onClick={this.decreaseCardBttn.bind(this, name)}>decrease</button>
                    </div>
                )
            })
        })

        this.setState({
            isCardSelected: true
        })
    }

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
        
        this.setState({
            renderPressedCards: name_array.map((name, index) => {
                let key = 'pressed-card-' + index
                return(
                    <div key={key}>
                        <p>{name}: x{value_array[index]} </p>
                        <button type="button" onClick={this.decreaseCardBttn.bind(this, name)}>decrease</button>
                    </div>
                )
            })
        })

        this.setState({
            isCardSelected: true
        })
    }

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
        const cardSocket = socketIOClient(serverUrl + 'get-cards')

        cardSocket.on('GetCards', data => {
            if(this._isMounted){
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
            }
        })

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

                for(var key in currentRoles){
                    if(currentRoles.hasOwnProperty(key))
                    {
                        if(currentRoles[key] > 0){
                            name_array.push(key)
                            value_array.push(currentRoles[key])
                        }
                            
                    }
                }
                
                this.setState({
                    renderPressedCards: name_array.map((name, index) => {
                        let key = 'pressed-card-' + index
                        return(
                            <div key={key}>
                                <p>{name}: x{value_array[index]} </p>
                                <button type="button" onClick={this.decreaseCardBttn.bind(this, name)}>decrease</button>
                            </div>
                        )
                    })
                })
            }
            
        })
    }
    
    componentWillUnmount(){
        this._isMounted = false
    }

    render(){
        return(
            <>
                {this.state.renderCards}
                
                <div className = "display-chosen-cards">    
                    <b>Current Chosen Cards Panel:</b>
                    {this.state.renderPressedCards}

                    <br></br>
                    {this.state.isCardSelected ?
                        <button type="button" onClick={this.submitCardsBttn.bind(this)}>submit</button>
                        :
                        null
                    }
                </div>
            </>
        )
    }
}


export default DisplayCards