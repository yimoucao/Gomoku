import React from 'react'

class Panel extends React.Component {
    render() {
        return (
            <div>
                <form onSubmit={(e) => this.props.nameSubmitHandler(e)}
                    className="form-inline">
                    <div className="form-group">
                        <label htmlFor="name-input">Input your name:</label>
                        <input onChange={(event) => this.props.nameInputHandler(event)}
                            type="text" className="form-control mx-sm-3" id="name-input" />
                    </div>
                    <button className="btn btn-primary" type="submit">Connect</button>
                    {/* <span>{this.props.showName}</span> */}

                </form>
            </div>
        );
    };
}

export default Panel;