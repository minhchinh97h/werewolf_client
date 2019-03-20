import React, { Component } from 'react';
import "./Header.css"


class Header extends Component{

    ChooseUserTab = (e) => {
        //Display which user tab is highlighted
        document.getElementById("user-tab-button").classList.remove("tab-active")
        document.getElementById("card-collection-button").classList.remove("tab-active")
        document.getElementById("final-tab-button").classList.remove("tab-active")

        document.getElementById("user-tab-button").classList.add("tab-active")


        //transition to user tab, card collection tab of Admin page is automatically shown at first (firstly visible, others are invisible)
        document.getElementById("room-information-container").classList.remove("room-information-container-visible")
        document.getElementById("display-cards-container").classList.remove("display-cards-container-invisible")

        document.getElementById("room-information-container").classList.add("room-information-container-visible")
        document.getElementById("display-cards-container").classList.add("display-cards-container-invisible")
    }

    ChooseCardCollectionTab = () => {
        //Display which card collection tab is highlighted
        document.getElementById("user-tab-button").classList.remove("tab-active")
        document.getElementById("card-collection-button").classList.remove("tab-active")
        document.getElementById("final-tab-button").classList.remove("tab-active")

        document.getElementById("card-collection-button").classList.add("tab-active")


        //transition to card collection tab
        document.getElementById("room-information-container").classList.remove("room-information-container-visible")
        document.getElementById("display-cards-container").classList.remove("display-cards-container-invisible")
    }

    ChooseFinalTab = () => {
        //Display which final tab is highlighted
        document.getElementById("user-tab-button").classList.remove("tab-active")
        document.getElementById("card-collection-button").classList.remove("tab-active")
        document.getElementById("final-tab-button").classList.remove("tab-active")

        document.getElementById("final-tab-button").classList.add("tab-active")
    }

    componentDidMount(){

    }

    render(){
        return(
            <div className="header-container header-container-admin" id="header">
                <button className="header-item-holder" onClick={this.ChooseUserTab} id="user-tab-button">
                    <i className="fas fa-user fa-lg"></i>
                </button>
                <button className="header-item-holder tab-active" onClick={this.ChooseCardCollectionTab} id="card-collection-button">
                    <i className="fas fa-boxes fa-lg"></i>

                </button>
                <button className="header-item-holder" onClick={this.ChooseFinalTab} id="final-tab-button">
                    <i className="fas fa-clipboard-list fa-lg"></i>
                </button>
                
            </div>
        )
    }
}

export default Header