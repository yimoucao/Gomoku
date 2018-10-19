import React from "react";

class GameInfo extends React.Component {
    renderTurnHint() {
        if (this.props.info.turn === true) {
            return (
                <h5>&nbsp;<span className="badge badge-pill badge-info">&nbsp;Now your turn&nbsp;</span>&nbsp;</h5>
            );
        }
        else {
            return (
                <h5>&nbsp;<span className="badge badge-pill badge-info">Opponent's turn</span>&nbsp;</h5>
            );
        }
    }
    renderInfo() {
        if (this.props.info.won === null) { return this.renderTurnHint(); }
        else if (this.props.info.won === true) { return (<h2>&nbsp;<span className="badge badge-pill badge-success">You Win!</span>&nbsp;</h2>); }
        else { return (<h2>&nbsp;<span className="badge badge-pill badge-danger">You Lose!</span>&nbsp;</h2>); }
    }
    render() {
        return (
            <div>
                {this.renderInfo()}
            </div>);
    }
}

export default GameInfo;