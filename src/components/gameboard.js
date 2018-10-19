import React from 'react';

class Square extends React.Component {
    renderStone() {
        if (this.props.value === "X") {
            return ("⚪️");
        } else if (this.props.value === "O") {
            return ("⚫️");
        }
    }

    render() {
        return (
            <button className="square" onClick={(e) => this.props.onButtonClick(e)}>
                {this.renderStone()}
            </button>
        );
    }
}


class Board extends React.Component {
    constructor(props) {
        super(props);
        this.dimension = 15
    }
    renderSquare(value, key) {
        return <Square value={value}
            key={key}
            onButtonClick={(e) => this.props.onSquareClick(e, key)}
        />;
    }
    renderRow(iRow) {
        var row = [];
        var rPlacings = this.props.placings.slice(iRow * this.dimension, (iRow + 1) * this.dimension);
        for (var i = 0.; i < rPlacings.length; i++) {
            row.push(this.renderSquare(rPlacings[i], iRow * this.dimension + i));
        }
        return row;
    }
    renderBoard() {
        var rows = [];
        for (var i = 0; i < this.dimension; i++) {
            rows.push(this.renderRow(i));
        }
        return rows;
    }

    render() {

        return (
            <div>
                {this.renderBoard().map(
                    (row, i) => {
                        return (
                            <div className="board-row" key={"row" + i}>{row}</div>
                        );
                    }
                )
                }
            </div>
        );
    }
}

export default Board;