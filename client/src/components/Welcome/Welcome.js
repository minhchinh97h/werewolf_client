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
                    <p className="small-title-description">This game is not in use for any business purposes</p>
                </div>
                <div className="Welcome-page-body">
                    <p>Press Play to start!</p>
                </div>
                <div className="Welcome-page-button">
                    <button onClick={this.playButton}>
                        Play
                    </button>
                </div>
            </div>
        )
    }
}

export default Welcome