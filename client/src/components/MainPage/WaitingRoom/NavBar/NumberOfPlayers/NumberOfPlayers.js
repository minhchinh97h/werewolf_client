import React, { Component } from 'react'


class NumberOfPlayers extends Component{

    render(){
        return(
            <>
                <p>{this.props.numberOfPlayers}</p>
            </>
        )
    }
}

export default NumberOfPlayers