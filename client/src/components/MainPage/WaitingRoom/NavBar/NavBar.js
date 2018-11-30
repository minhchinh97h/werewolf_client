import React, { Component } from 'react'

import GetAdmin from './GetAdmin/GetAdmin'
import NumberOfPlayers from './NumberOfPlayers/NumberOfPlayers'
import StartBttn from './StartBttn/StartBttn'

class NavBar extends Component{

    state = {
        
    }

    componentDidMount(){
    }

    render(){
        return(
            <>
                <div className="admin-section">
                    <GetAdmin admin={this.props.admin} />
                </div>
                <div className="number-of-player-section">
                    <NumberOfPlayers numberOfPlayers = {this.props.numberOfPlayers} roomid = {this.props.roomid}/>
                </div>

                { this.props.ifAdmin ? 
                    <div className="start-button-section">
                        <StartBttn />
                    </div>

                    :

                    null
                }
                
            </>
        )
    }
}

export default NavBar