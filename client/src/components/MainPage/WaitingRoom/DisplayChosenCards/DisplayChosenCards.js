import React, { Component } from 'react'

import socketIOClient from 'socket.io-client'

const serverUrl = 'http://localhost:3001/'


class DisplayChosenCards extends Component{

    state = {
        renderChosenCards: null
    }

    componentDidMount(){
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
                            <div key={key}>
                                <p>{data}</p>
                            </div>
                        )
                    })
                })
            }
            
        })
    }

    render(){
        return(
            <>
                {this.state.renderChosenCards}
            </>
        )
    }
}

export default DisplayChosenCards