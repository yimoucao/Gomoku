import React from 'react'

class Status extends React.Component {
    getClasses() {
        if (this.props.connectStatus === "Not Connected") {
            return "alert alert-warning d-flex justify-content-between";
        } else if (this.props.connectStatus.includes("Failed to connect")) {
            return "alert alert-danger d-flex justify-content-between";
        } else {
            return "alert alert-info d-flex justify-content-between";
        }
    }
    render() {
        return (
            <div className={this.getClasses()}>
                <div>
                    Hello, <span className="alert-link">
                        {this.props.playerName ? this.props.playerName : "visitor"}
                    </span>
                </div>
                <div>
                    Server: {this.props.connectStatus}
                </div>
            </div>
        );
    }
}

export default Status;