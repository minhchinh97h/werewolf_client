import React, { Component } from 'react'

class GetAdmin extends Component{

    componentDidMount(){
        
    }

    render(){
        return(
            <>
                <p>The Room's Admin is: {this.props.admin}</p>
            </>
        )
    }
}

export default GetAdmin