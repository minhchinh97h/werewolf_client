import React, { Component } from 'react'

import chosenCards from '../../../../../local-data-holder/cardArray'

class StartBttn extends Component{

    display = () => {
        console.log(chosenCards)
    }
    render(){
        return(
            <>
                <button type='button' onClick={this.display}>Start the game</button>
            </>
        )
    }
}

export default StartBttn