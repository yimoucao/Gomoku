import React from 'react';
import ReactDOM from 'react-dom';
import isWin from './checkwin.js';
import './index.css';

class Square extends React.Component {
  render() {
    return (
      <button className="square" onClick={(e)=>this.props.onButtonClick(e)}>
        {this.props.value}
      </button>
      // <button className="square">&#10011;</button>
    );
  }
}


class Board extends React.Component {
  constructor(props){
    super(props);
    this.dimension = 15
  }
  renderSquare(value, key) {
    return <Square value={value} 
              key={key} 
              onButtonClick={(e)=>this.props.onSquareClick(e, key)}
            />;
  }
  renderRow(iRow){
    var row = [];
    var rPlacings = this.props.placings.slice(iRow*this.dimension, (iRow+1)*this.dimension);
    for (var i = 0.; i <rPlacings.length; i++) {
        row.push(this.renderSquare(rPlacings[i], iRow*this.dimension+i));
    }
    return row;
  }
  renderBoard(){
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
            (row, i)=>{return (
                <div className="board-row" key={"row"+i}>{row}</div>
            );
            }
            )
        }
      </div>
    );
  }
}

class GameInfo extends React.Component {
  renderTurnHint(){
    if(this.props.info.turn===true){
      return (
        <h5>&nbsp;<span className="badge badge-pill badge-info">&nbsp;Now your turn&nbsp;</span>&nbsp;</h5>
        );
    }
    else{
      return (
        <h5>&nbsp;<span className="badge badge-pill badge-info">Opponent's turn</span>&nbsp;</h5>
        );
    }
  }
  renderInfo(){
    if(this.props.info.won===null)
    {return this.renderTurnHint();}
    else if(this.props.info.won===true)
    {return (<h2>&nbsp;<span className="badge badge-pill badge-success">You Win!</span>&nbsp;</h2>);}
    else
    {return (<h2>&nbsp;<span className="badge badge-pill badge-danger">You Lose!</span>&nbsp;</h2>);}
  }
  render() {
    return (
      <div>
        {this.renderInfo()}
      </div>);
  }
}

class Game extends React.Component {
  gamerRenderOpponentInfo(){
    return (
        <div className="mx-2">
            You are in Game #{this.props.gameId}, with player {this.props.opponentName}&nbsp;
            {this.props.opponentStatus?
              <span className="badge badge-warning">{this.props.opponentStatus}</span>:null
            }
        </div>
      );
  }

  watcherRenderOthersInfo(watchInfo){
    return (
        <div className="mx-2">
            You are in Game #{this.props.gameId}, watching {watchInfo.gamer1}
            &nbsp;vs&nbsp;{watchInfo.gamer2}&nbsp;
            {watchInfo.gameInfo?
              <span className="badge badge-info">{watchInfo.gameInfo}</span>:null
            }
        </div>
      );
  }

  render() {
    return (
      <div>
        <div className="d-flex align-items-center mb-2">
          <div>
          <button className="btn btn-outline-info btn-sm" onClick={()=>this.props.leaveClickHandler()}>
            <span role="img" aria-label="leave">🏃</span>Leave</button>
          </div>
          {this.props.watch?
            this.watcherRenderOthersInfo(this.props.watchInfo):
            this.gamerRenderOpponentInfo()
          }
        </div>
        <div className="clearfix"></div>
        <div className="game row d-flex justify-content-center">
          <div className="game-board col-sm-6 d-flex justify-content-end" style={{minWidth:"max-content"}}>
            <Board placings={this.props.placings}
              onSquareClick={(e, key)=>this.props.squareClickHandler(e, key)}
            />
          </div>
          {this.props.watch?null:
            (
              <div className="game-info col-md-4">
                <GameInfo info={{won:this.props.won,turn:this.props.turn}}/>
              </div>
            )
          }
          
        </div>
      </div>
    );
  }
}

class Status extends React.Component {
  getClasses(){
    if (this.props.connectStatus==="Not Connected") {
      return "alert alert-warning d-flex justify-content-between";
    } else if(this.props.connectStatus.includes("Failed to connect")){
      return "alert alert-danger d-flex justify-content-between";
    }else {
      return "alert alert-info d-flex justify-content-between";
    }
  }
  render(){
    return (
      <div className={this.getClasses()}>
        <div>
          Hello, <span className="alert-link">
            {this.props.playerName?this.props.playerName:"visitor"}
            </span>
        </div>
        <div>
          Server: {this.props.connectStatus}
        </div>
      </div>
    );
  }
}

class Panel extends React.Component {
    render(){
        return (
        <div>
            <form onSubmit={(e)=>this.props.nameSubmitHandler(e)}
                  className="form-inline">
            <div className="form-group">
            <label htmlFor="name-input">Input your name:</label>
            <input onChange={(event)=>this.props.nameInputHandler(event)}
                  type="text" className="form-control mx-sm-3" id="name-input"/>
            </div>            
            <button className="btn btn-primary" type="submit">Connect</button>
            {/* <span>{this.props.showName}</span> */}
            
            </form>
        </div>
        );
    };
}

class GamesList extends React.Component {
  renderNewGameBtn(){
    return (<button onClick={(e)=>this.props.newGameBtnHandler(e)}
              className="btn btn-sm btn-secondary">New Game</button>);
  }

  renderChooseGameBtn(game_id, index){
    return (<button onClick={(e)=>this.props.gameChosenBtnHandler(e, game_id)}
              key={index} style={{cursor: "pointer"}}
              type="button" className="list-group-item list-group-item-action">
              Game&nbsp;#{game_id}
            </button>
            );
  }

  render() {
    if(!this.props.gameslist){
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
    else{
      return (
        <div className="list-group">
          <a className="list-group-item d-flex justify-content-between align-items-center">
          <div><span className="badge badge-primary badge-pill">{this.props.gameslist.length}</span>
          &nbsp;Games Available</div>
          {this.renderNewGameBtn()}
          </a>
          {this.props.gameslist.map((item, index)=>{
            return this.renderChooseGameBtn(item, index);
          })}
        </div>
      );
    }
  };
}


class App extends React.Component {
    render() {
      return (
          <div>
              <Status connectStatus={this.state.connectStatus} playerName={this.state.playerName}/>
              {this.state.connected?
                null:
                <Panel nameInputHandler={(e)=>this.nameInputHandler(e)} 
                    nameSubmitHandler={(e)=>this.nameSubmitHandler(e)}
                    // showName={this.state.nameInput}
                    />
              }
              {(this.state.connected&&this.state.gameId===null)?
                <GamesList gameslist={this.state.gameslist} 
                newGameBtnHandler={(e)=>this.newGameBtnHandler(e)}
                gameChosenBtnHandler={(e, game_id)=>this.gameChosenBtnHandler(e, game_id)}
                />
                :null
              }
              {(this.state.gameId!=null && !this.state.gamePaired)?
                <div>
                <button className="btn btn-outline-info btn-sm" onClick={()=>this.leaveClickHandler()}>
                <span role="img" aria-label="leave">🏃</span>Cancel waiting</button>&nbsp;
                <span>You entered Game #{this.state.gameId}, waiting for another player...</span>
                </div>
                :null
              }
              {this.state.gamePaired?
                <Game gameId={this.state.gameId} opponentName={this.state.opponentName}
                placings={this.state.placings}  won={this.state.won} turn={this.state.myTurn} 
                opponentStatus={this.state.opponentStatus}
                watch={this.state.watch}
                watchInfo={this.state.watchInfo}
                leaveClickHandler={()=>this.leaveClickHandler()}
                squareClickHandler={(e, key)=>this.squareClickHandler(e, key)}
                />
                :null
              }
          </div>
      );
  }
    
    constructor(props){
        super(props);
        this.state = {
          nameInput: null,
          playerName: null,
          connectStatus: "Not Connected",
          connected: false, // to determine show input box or not
          gameslist: null,
          gameId: null, // which game is on going: gameId is in state, game_id is from button
          gamePaired: false, //true, indicating another player arrived
          gameStarted: false, // true: game's on; false: not started or finished
          placings: Array(15*15).fill(null), // player placing data
          stone: null,
          myTurn: false,
          opponentName: null,
          opponentStatus: null,
          won: null,
          watch: null, // watch = true, watching a game
          watchInfo:{gamer1:null, gamer2:null, gameInfo:null},
        };
        this.ws = null;
        this.playerID = null;
    }
    nameInputHandler(event){
        this.setState({nameInput: event.target.value});
    }
    nameSubmitHandler(e){
      e.preventDefault();
      if (!this.state.nameInput){
        alert("Invalid Name");
        return;
      }
      // console.log(this.state.nameInput);
      // connect ws
      this.setState({connectStatus: "connecting"});
      console.log(window.location.hostname)
      var ws_url = "ws://" + window.location.hostname + ":5000/connect";
      this.ws = new WebSocket(ws_url);
      this.ws.onopen = (e)=>{this.wsOpenHandler(e)};
      this.ws.onmessage = (e)=>{this.wsMessageHandler(e)};
      this.ws.onerror = (e)=>{this.wsErrorHandler(e)};

    }

    wsOpenHandler(e){
      this.setState({
        connectStatus: "connected",
        connected: true,
        playerName: this.state.nameInput,
      });
      this.wsSendMessage(["new_player", this.state.nameInput]);
    }
    wsMessageHandler(e){
      var json = JSON.parse(e.data);
      if (!(json[0] instanceof Array))
          json = [json];

      for(var i = 0; i < json.length; i++){
          var args = json[i];
          var cmd = json[i][0];
          // console.log("args: "+args[1]);
          // console.log("args: "+args[2]);
          switch(cmd){
            case("handshake"):
              this.playerID=args[1];
              break;
            case("gameslist"):
              console.log("get gameslist data");
              this.setState({gameslist: args[1]});
              break;
            case("newgame_ack"):
              console.log("get new game, its id: "+args[1])
              this.setState({gameId: args[1]});
              break;
            case("game_start"):
              // ["game_start", game_id, your_stone, opponent_name]
              console.log("game start: id:"+args[1]+" stone: "+args[2])
              this.setState({
                gameId: args[1],
                stone: args[2],
                opponentName: args[3],
                gamePaired: true,
                myTurn: args[2]==="X"?true:false,
                gameStarted: true,
              });
              break;
            case("opponent_move"):
              // console.log("got opponent move, position: "+args[1]+" stone: "+args[2]);
              // var key = args[1];
              // var stone = args[2];
              // var newPlacings = this.state.placings.slice();
              // newPlacings[key] = stone;
              var newPlacings = args[1];
              this.setState({placings:newPlacings});
              this.setState({myTurn: true})
              break;
            case("you_win"):
              this.setState({
                gameStarted: false,
                won: true,
              });
              break;
            case("you_lose"):
              this.setState({
                gameStarted: false,
                won: false,
              });
              break;
            case("opponent_offline"):
              console.log("get offline");
              this.setState({
                gameStarted: false,
                // won: false,
                opponentStatus: "offline",
              });
              break;
            case("opponent_left"):
              console.log("received opponent left")
              this.setState({
                gameStarted: false,
                // won: false,
                opponentStatus: "left",
              });
              break;
            case("you_watch"):
              console.log("you watch: id:"+args[1]);
              let watchInfo = {...this.state.watchInfo};//creating copy of object
              watchInfo.gamer1 = args[3]; //updating value
              watchInfo.gamer2 = args[4];
              watchInfo.gameInfo = args[5];
              this.setState({
                gameId: args[1],
                gamePaired: true,
                myTurn: false,
                placings: args[2],
                watch: true,
                watchInfo:watchInfo,
              });
              break;
            default:
              console.log("Invalid data from server");
          }
      }
    }

    wsErrorHandler(e){
      this.setState({connectStatus: "Failed to connect: "+getWsErrorReason(e.code)});
    }

    wsSendMessage(msgArray){
      if(!this.ws){alert("Connetion error: no WebSocket");return;}
      var msg = JSON.stringify(msgArray);
      this.ws.send(msg);
    }

    squareClickHandler(e, key){
      // console.log(key+" clicked");
      
      if (this.state.watch) {
        console.log("watcher cannot place");
        return;
      }
      if(!this.state.gameStarted){
        // alert("Game is not on / is finished");
        return;
      }      
      if(!this.state.myTurn){
        alert("It's not your turn!");
        return;
      }
      if(!this.state.stone){
        alert("Error: you have no stone to place! Did you connected?");
        return;
      }
      if(this.state.placings[key]){
        console.log("You cannot place here");
        return;
      }
      var newPlacings = this.state.placings.slice();
      newPlacings[key] = this.state.stone;
      this.setState({placings:newPlacings});
      // this.wsSendMessage(["new_move", key]);
      this.wsSendMessage(["new_move", newPlacings]);
      this.setState({myTurn: false});
      if(isWin(newPlacings)){
        console.log("win");
        this.setState({gameStarted: false});
        this.wsSendMessage(["I_win"]);
      }
    }

    newGameBtnHandler(e){
      this.wsSendMessage(["new_game", this.playerID]);
    }

    gameChosenBtnHandler(e, game_id){
      this.wsSendMessage(["join_game", game_id]);
    }

    leaveClickHandler(){
      this.wsSendMessage(["left_game", this.state.gameId]);
      this.setState({
        gameId: null, // which game is on going: gameId is in state, game_id is from button
        gamePaired: false, //true, indicating another player arrived
        gameStarted: false, // true: game's on; false: not started or finished
        placings: Array(15*15).fill(null), // player placing data
        stone: null,
        myTurn: false,
        opponentName: null,
        opponentStatus: null,
        won: null,
        watch: null, // watch = true, watching a game
        watchInfo:{gamer1:null, gamer2:null, gameInfo:null},
      });
    }

    
}
// ========================================

//============== Util functions=================
function getWsErrorReason(code){
  var reason = "";
  console.log(typeof code);
  if (code === 1000)
    reason = "Normal closure, meaning that the purpose for which the connection was established has been fulfilled.";
  else if(code === 1001)
    reason = "An endpoint is \"going away\", such as a server going down or a browser having navigated away from a page.";
  else if(code === 1002)
    reason = "An endpoint is terminating the connection due to a protocol error";
  else if(code === 1003)
    reason = "An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).";
  else if(code === 1004)
    reason = "Reserved. The specific meaning might be defined in the future.";
  else if(code === 1005)
    reason = "No status code was actually present.";
  else if(code === 1006)
    reason = "The connection was closed abnormally, e.g., without sending or receiving a Close control frame";
  else if(code === 1007)
    reason = "An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629] data within a text message).";
  else if(code === 1008)
    reason = "An endpoint is terminating the connection because it has received a message that \"violates its policy\". This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy.";
  else if(code === 1009)
    reason = "An endpoint is terminating the connection because it has received a message that is too big for it to process.";
  else if(code === 1010) // Note that this status code is not used by the server, because it can fail the WebSocket handshake instead.
    reason = "An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn't return them in the response message of the WebSocket handshake. <br /> Specifically, the extensions that are needed are: " + reason;
  else if(code === 1011)
    reason = "A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.";
  else if(code === 1015)
    reason = "The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).";
  else
    reason = "Unknown reason";

  return reason;
}


// =======================================
ReactDOM.render(
  <App />,
  document.getElementById('root')
);