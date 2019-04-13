import React, { Component } from 'react'

import GetPlayers from '../../GetPlayers/GetPlayers'


class DevotedServant extends Component{

    state = {
        
    }

    componentDidMount(){

    }

    render(){
        return(
            <>
                <GetPlayers roomid = {this.props.roomid} username = {this.props.username} />
            </>
        )
    }
}   

export default DevotedServant