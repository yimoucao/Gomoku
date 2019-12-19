import logging
import random


class Game:

    _lastID = 0
    _Mapping = {}  # player:game pairs mappins of gamers, watchers excluded here
    _watchersMapping = {}

    @staticmethod
    def updateMapping(player, game):
        Game._Mapping.update({player: game})

    @staticmethod
    def getMapping(player):
        return Game._Mapping.get(player, None)

    @staticmethod
    def popMapping(player):
        Game._Mapping.pop(player, None)

    @staticmethod
    def updateWatchersMapping(watcher, game):
        Game._watchersMapping.update({watcher: game})

    @staticmethod
    def getWatchersMapping(watcher):
        return Game._watchersMapping.get(watcher, None)

    @staticmethod
    def popWatchersMapping(watcher):
        Game._watchersMapping.pop(watcher, None)

    def __init__(self, player1):
        self._id = Game._lastID
        Game._lastID += 1
        self.players = list()
        self.players.append(player1)
        Game.updateMapping(player1, self)
        self.recent_placings = list()
        self.game_on = False
        self.watchers = list()

    async def addPlayer(self, player2):
        # TODO: type check
        # TODO: player number check
        if len(self.players) < 2:
            self.players.append(player2)  # add to game's players list
            Game.updateMapping(player2, self)  # add to global mappings
            if len(self.players) == 2:
                await self.start()
        else:
            await self.addWatcher(player2)
        return

    # def removePlayer

    def emptyPlayers(self):
        [Game.popMapping(p) for p in self.players]
        self.players = list()  # set to an empty list

    async def start(self):
        if len(self.players) != 2:
            logging.info("cannot start")
            return

        # TODO: toss stone
        stones = ['X', 'O']
        random.shuffle(stones)  # shuffle in place
        # TODO: send 'game_start, game, stone, opponent for each player
        await self.players[0].sendGameStart(self, stones[0], self.players[1])
        await self.players[1].sendGameStart(self, stones[1], self.players[0])
        self.game_on = True
        # TODO: aync game loop???
        pass

    # def sendMove(self, position, from_player):
    #     if not from_player:
    #         # error
    #         return
    #     player0 = self.players[0]
    #     player1 = self.players[1]
    #     to_player = player0 if player0!=from_player else player1
    #     to_player.sendComponentMove(position, from_player.stone)

    async def sendMove(self, placings, from_player):
        if not from_player:
            # error
            return
        self.recent_placings = placings
        player0 = self.players[0]
        player1 = self.players[1]
        to_player = player0 if player0 != from_player else player1
        await to_player.sendComponentMove(placings, from_player.stone)
        msg = "{}'s turn".format(to_player.playerName)
        await self.broadcastToWatchers(msg=msg)

    async def sendFinish(self, from_player, normal=True):
        if not from_player:
            # error
            return
        if normal:
            player0 = self.players[0]
            player1 = self.players[1]
            loser = player0 if player0 != from_player else player1
            await from_player.sendWin()
            await loser.sendLose()
            msg = "{} won".format(from_player.playerName)
            await self.broadcastToWatchers(msg=msg)
        else:
            # not normal, board is full
            pass
        self.game_on = False

    def isOn(self):
        return self.game_on

    async def sendOffline(self, offliner):
        if not offliner:
            # error
            pass
        player0 = self.players[0]
        try:
            player1 = self.players[1]
            receiver = player0 if player0 != offliner else player1
            await receiver.sendOffline(offliner)
        except IndexError:
            pass
        self.game_on = False

    async def sendLeave(self, quitor):
        if not quitor:
            # error
            pass
        player0 = self.players[0]
        try:
            player1 = self.players[1]
            receiver = player0 if player0 != quitor else player1
            await receiver.sendLeave(quitor)
        except IndexError:
            pass
        self.game_on = False

    async def addWatcher(self, watcher):
        self.watchers.append(watcher)
        Game.updateWatchersMapping(watcher, self)
        await self.ackWatcher(watcher)

    def removeWatcher(self, watcher):
        self.watchers = [w for w in self.watchers if w != watcher]
        Game.popWatchersMapping(watcher)

    async def ackWatcher(self, watcher, msg=None):
        await watcher.sendWatch(self, self.players[0], self.players[1], msg)

    async def broadcastToWatchers(self, msg):
        for watcher in self.watchers:
            await self.ackWatcher(watcher, msg)
