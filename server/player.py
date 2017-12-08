
import json

class PlayerAgent:

    _lastID = 0
    _Mapping = {}

    @staticmethod
    def updateMapping(ws, player):
        PlayerAgent._Mapping.update({ws: player})

    @staticmethod
    def getMapping(ws):
        return PlayerAgent._Mapping.get(ws, None)

    @staticmethod
    def popMapping(ws):
        PlayerAgent._Mapping.pop(ws, None)

    @staticmethod
    def sendAllGamesList(games):
        for player in PlayerAgent._Mapping.values():
            player.sendGamesList(games)

    def __init__(self, playerName, ws):
        #TODO: ws type check
        self._id = PlayerAgent._lastID
        PlayerAgent._lastID += 1
        self.playerName = playerName
        self._ws = ws
        self.stone = None
        PlayerAgent.updateMapping(ws, self)



    def initialHandshake(self):
        # msg = json.dumps([('handshake', self._id, 'x')])
        # self._ws.send_str(msg)
        self._sendMessage('handshake', self._id)

    def sendGamesList(self, games):
        if not games:
            self._sendMessage('gameslist', None)
            return
        gamesList = [game._id for game in games]
        self._sendMessage('gameslist', gamesList)
        return

    def sendGameAck(self, game):
        self._sendMessage('newgame_ack', game._id)
        return

    def sendGameStart(self, game, stone, opponent):
        self.stone = stone
        self._sendMessage('game_start', game._id, stone, opponent.playerName)

    # def sendComponentMove(self, position, stone):
    #     if not position or not stone:
    #         # error
    #         return
    #     self._sendMessage('opponent_move', position, stone)

    def sendComponentMove(self, placings, stone):
        if not placings or not stone:
            # error
            return
        self._sendMessage('opponent_move', placings, stone)

    def sendWin(self):
        self._sendMessage('you_win')

    def sendLose(self):
        self._sendMessage('you_lose')

    def sendOffline(self, offliner):
        self._sendMessage('opponent_offline', offliner.playerName)

    def sendLeave(self, quitor):
        self._sendMessage('opponent_left', quitor.playerName)

    def sendWatch(self, game, gamer1, gamer2, msg=None):
        self._sendMessage('you_watch', game._id, game.recent_placings, gamer1.playerName, gamer2.playerName, msg)

    def _sendMessage(self, *args):
        msg = json.dumps([args])
        self._ws.send_str(msg)





