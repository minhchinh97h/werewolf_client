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
                    <p className="small-title-description">ver. 1.0.0</p>
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