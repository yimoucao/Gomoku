import React from 'react';
import ReactDOM from 'react-dom';
import Status from './components/greetingbar';
import Panel from './components/inputpanel';
import GamesList from './components/gamelist';
import Game from './components/game'

import isWin from './checkwin';
import getWsErrorReason from './utils'
import './index.css';

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
      // console.log(window.location.hostname)
      var ws_url = "ws://" + window.location.hostname + ":5000/connect";
      this.ws = new WebSocket(ws_url);
      this.ws.onopen = (e)=>{this.wsOpenHandler(e)};
      this.ws.onmessage = (e)=>{this.wsMessageHandler(e)};
      this.ws.onerror = (e)=>{this.wsErrorHandler(e)};
      this.ws.onclose = (e)=>{this.wsErrorHandler(e)};

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

// =======================================
ReactDOM.render(
  <App />,
  document.getElementById('root')
);