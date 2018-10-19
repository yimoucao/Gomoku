import React from 'react'

class GamesList extends React.Component {
    renderNewGameBtn() {
        return (<button onClick={(e) => this.props.newGameBtnHandler(e)}
            className="btn btn-sm btn-secondary">New Game</button>);
    }

    renderChooseGameBtn(game_id, index) {
        return (<button onClick={(e) => this.props.gameChosenBtnHandler(e, game_id)}
            key={index} style={{ cursor: "pointer" }}
            type="button" className="list-group-item list-group-item-action">
            Game&nbsp;#{game_id}
        </button>
        );
    }

    render() {
        if (!this.props.gameslist) {
            return (
                <div className="list-group">
                    <a className="list-group-item d-flex justify-content-between align-items-center">
                        <div><span className="badge badge-primary badge-pill">0</span>
                            &nbsp;Games Available</div>
                        {this.renderNewGameBtn()}
                    </a>
                </div>
            )
        }
        else {
            return (
                <div className="list-group">
                    <a className="list-group-item d-flex justify-content-between align-items-center">
                        <div><span className="badge badge-primary badge-pill">{this.props.gameslist.length}</span>
                            &nbsp;Games Available</div>
                        {this.renderNewGameBtn()}
                    </a>
                    {this.props.gameslist.map((item, index) => {
                        return this.renderChooseGameBtn(item, index);
                    })}
                </div>
            );
        }
    };
}

export default GamesList;