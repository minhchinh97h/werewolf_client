import React, { Component } from 'react'
class NumberOfPlayers extends Component{

    state = {

    }

    render(){
        return(
            <>
                <p>{this.props.numberOfPlayers}</p>
            </>
        )
    }
}

export default NumberOfPlayers