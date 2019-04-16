import React, { Component } from 'react'
import './Welcome.css'

class Welcome extends Component{

    state={}

    playButton = () => {
        this.props.history.push(`/login`)
    }

    componentDidMount(){
    }

    componentDidUpdate(prevProps, prevState){
    }    

    render(){
        return(
            <div className="Welcome-page-cover">
                <div className="Welcome-page-title">
                    <h2>The Werewolves of Millers Hollow</h2>
                    <p className="small-title-description">DMC's ver. 1.0.0</p>
                    <b className="small-title-description">Source Code: </b>  <a target="_blank" className="small-title-description" href="https://github.com/minhchinh97h/werewolf_client">Client</a>  <a target="_blank" className="small-title-description" href="https://github.com/minhchinh97h/werewolf_server">Server</a>
                </div>

                <div className="Welcome-page-button">
                    <button onClick={this.playButton}>
                        Play
                    </button>
                </div>

                <div className="welcome-bottom-link">
                    
                </div>
            </div>
        )
    }
}

export default Welcome