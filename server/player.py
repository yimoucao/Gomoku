import logging
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
    async def sendAllGamesList(games):
        for player in PlayerAgent._Mapping.values():
            await player.sendGamesList(games)

    def __init__(self, playerName, ws):
        # TODO: ws type check
        self._id = PlayerAgent._lastID
        PlayerAgent._lastID += 1
        self.playerName = playerName
        self._ws = ws
        self.stone = None
        PlayerAgent.updateMapping(ws, self)

    async def initialHandshake(self):
        # msg = json.dumps([('handshake', self._id, 'x')])
        # self._ws.send_str(msg)
        await self._sendMessage('handshake', self._id)

    async def sendGamesList(self, games):
        if not games:
            await self._sendMessage('gameslist', None)
            return
        gamesList = [game._id for game in games]
        await self._sendMessage('gameslist', gamesList)
        return

    async def sendGameAck(self, game):
        await self._sendMessage('newgame_ack', game._id)

    async def sendGameStart(self, game, stone, opponent):
        self.stone = stone
        await self._sendMessage('game_start', game._id, stone, opponent.playerName)

    # def sendComponentMove(self, position, stone):
    #     if not position or not stone:
    #         # error
    #         return
    #     self._sendMessage('opponent_move', position, stone)

    async def sendComponentMove(self, placings, stone):
        if not placings or not stone:
            # error
            return
        await self._sendMessage('opponent_move', placings, stone)

    async def sendWin(self):
        await self._sendMessage('you_win')

    async def sendLose(self):
        await self._sendMessage('you_lose')

    async def sendOffline(self, offliner):
        await self._sendMessage('opponent_offline', offliner.playerName)

    async def sendLeave(self, quitor):
        await self._sendMessage('opponent_left', quitor.playerName)

    async def sendWatch(self, game, gamer1, gamer2, msg=None):
        await self._sendMessage('you_watch', game._id, game.recent_placings, gamer1.playerName, gamer2.playerName, msg)

    async def _sendMessage(self, *args):
        msg = json.dumps([args])
        await self._ws.send_str(msg)
