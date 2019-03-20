import React, { Component } from 'react'

import socketIOClient from 'socket.io-client'

import serverUrl from '../../../../serverUrl'

import './DisplayChosenCards.css'

class DisplayChosenCards extends Component{
    _isMounted = false

    state = {
        renderChosenCards: null
    }

    componentDidMount(){
        this._isMounted = true

        if(this._isMounted){
            const socket = socketIOClient(serverUrl + 'get-current-roles')
        
            socket.on('connect', () => {
                socket.emit('JoinRoom', this.props.roomid)
            })

            socket.on('GetSelectedCards', data => {
                if(data !== null){
                    let cards = []

                    for(var key in data){
                        if(data.hasOwnProperty(key)){
                            if(data[key] > 0)
                                cards.push(key + ' x' + data[key])
                        }
                    }
                    this.setState({
                        renderChosenCards: cards.map((data, index) => {
                            let key = 'chosen-roles-' + index
                            return(
                                <div key={key} className="chosen-card-container">
                                    <p>{data}</p>
                                </div>
                            )
                        })
                    })
                }
                
            })
        }
        
    }

    componentWillUnmount(){
        this._isMounted = false
    }

    render(){
        return(
            <>
            <div className="display-chosen-cards">
                {this.state.renderChosenCards}
            </div>
                
            </>
        )
    }
}

export default DisplayChosenCards