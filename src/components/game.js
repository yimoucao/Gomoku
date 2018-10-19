import React from 'react'
import Board from './gameboard'
import GameInfo from './gameinfo'

export default class Game extends React.Component {
    gamerRenderOpponentInfo() {
        return (
            <div className="mx-2">
                You are in Game #{this.props.gameId}, with player {this.props.opponentName}&nbsp;
            {this.props.opponentStatus ?
                    <span className="badge badge-warning">{this.props.opponentStatus}</span> : null
                }
            </div>
        );
    }

    watcherRenderOthersInfo(watchInfo) {
        return (
            <div className="mx-2">
                You are in Game #{this.props.gameId}, watching {watchInfo.gamer1}
                &nbsp;vs&nbsp;{watchInfo.gamer2}&nbsp;
            {watchInfo.gameInfo ?
                    <span className="badge badge-info">{watchInfo.gameInfo}</span> : null
                }
            </div>
        );
    }

    render() {
        return (
            <div>
                <div className="d-flex align-items-center mb-2">
                    <div>
                        <button className="btn btn-outline-info btn-sm" onClick={() => this.props.leaveClickHandler()}>
                            <span role="img" aria-label="leave">🏃</span>Leave</button>
                    </div>
                    {this.props.watch ?
                        this.watcherRenderOthersInfo(this.props.watchInfo) :
                        this.gamerRenderOpponentInfo()
                    }
                </div>
                <div className="clearfix"></div>
                <div className="game row d-flex justify-content-center">
                    <div className="game-board col-sm-6 d-flex justify-content-end" style={{ minWidth: "max-content" }}>
                        <Board placings={this.props.placings}
                            onSquareClick={(e, key) => this.props.squareClickHandler(e, key)}
                        />
                    </div>
                    {this.props.watch ? null :
                        (
                            <div className="game-info col-md-4">
                                <GameInfo info={{ won: this.props.won, turn: this.props.turn }} />
                            </div>
                        )
                    }

                </div>
            </div>
        );
    }
}