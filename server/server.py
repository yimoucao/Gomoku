import os
import asyncio
import json
from aiohttp import web, WSMsgType
import logging

from player import PlayerAgent
from game import Game

DIR_PATH = os.path.dirname(os.path.realpath(__file__))
INDEX_FILE_PATH = os.path.join(DIR_PATH, 'index.html')

logging.basicConfig(
    filename=os.path.join(DIR_PATH, 'log'),
    filemode='w', level=logging.DEBUG)

async def handle(request):
    try:
        with open(INDEX_FILE_PATH, 'rb') as index:
            return web.Response(body=index.read(), content_type='text/html')
    except FileNotFoundError:
        pass
    return web.Response(status=404)


async def wshandler(request):
    logging.info("Connected")
    app = request.app
    ws = web.WebSocketResponse()
    await ws.prepare(request)

    playerAgent = None
    while True:
        msg = await ws.receive()
        if msg.type == WSMsgType.TEXT:
            logging.info("Got message {}".format(msg.data))

            data = json.loads(msg.data)
            # if type(data) == int and player:
            #     # Interpret as key code
            #     player.keypress(data)
            if type(data) != list:
                continue

            # TODO: implement a message queue?
            # player is not there
            if not playerAgent:
                if data[0] == "new_player":
                    playerAgent = PlayerAgent(data[1].strip(), ws)
                    await playerAgent.initialHandshake()
                    await playerAgent.sendGamesList(app["games"])

                    # player = game.new_player(data[1], ws)
            else: # player is there
                if data[0] == "new_game":
                    game = Game(playerAgent) # open a new game add the player into the game
                    app["games"].append(game)
                    await playerAgent.sendGameAck(game)
                    await PlayerAgent.sendAllGamesList(app["games"])

                if data[0] == "join_game":
                    # get game obj
                    game = getGameInList(int(data[1]))
                    # TODO: if game is None, send errmsg to player
                    await game.addPlayer(playerAgent)

                if data[0] == "new_move":
                    from_player = PlayerAgent.getMapping(ws)
                    game = Game.getMapping(from_player)
                    await game.sendMove(data[1], from_player)

                if data[0] == "I_win":
                    # TODO: the server must validate if the user does win
                    from_player = PlayerAgent.getMapping(ws)
                    game = Game.getMapping(from_player)
                    await game.sendFinish(from_player, normal=True) # game_finish, you_win, you_lose
                    # game.emptyPlayers()
                    # removeGameInList(game)

                if data[0] == "left_game":
                    quitor = PlayerAgent.getMapping(ws)
                    game = Game.getMapping(quitor)
                    if game:
                        # if game.isOn():
                        await game.sendLeave(quitor)
                        # else:
                        game.emptyPlayers()
                        removeGameInList(game)
                    else: # the quitor might be a watcher
                        game = Game.getWatchersMapping(quitor)
                        game.removeWatcher(quitor) if game else None
                    await PlayerAgent.sendAllGamesList(app["games"])
                    # quitor.sendGamesList(app["games"])


        elif msg.type == WSMsgType.CLOSE:
            offliner = PlayerAgent.getMapping(ws)
            game = Game.getMapping(offliner)
            if game:
                # if game.isOn():
                logging.info("going to send offline")
                await game.sendOffline(offliner)
                # else:
                game.emptyPlayers()
                removeGameInList(game)
            else:  # the offliner might be a watcher
                game = Game.getWatchersMapping(offliner)
                game.removeWatcher(offliner) if game else None

            PlayerAgent.popMapping(ws)
            await PlayerAgent.sendAllGamesList(app["games"])
            break

    # if player:
    #     game.player_disconnected(player)

    logging.info("Closed connection")
    return ws

def getGameInList(game_id):
    """game_id should a integer"""
    games = app['games']
    if games:
        return [game for game in games if game._id == game_id][0]
    else:
        return None

def removeGameInList(game):
    app['games'] = [item for item in app['games'] if item != game]


event_loop = asyncio.get_event_loop()
event_loop.set_debug(True)

app = web.Application()

app["games"] = list()

app.router.add_route('GET', '/connect', wshandler)
app.router.add_route('GET', '/{name}', handle)
app.router.add_route('GET', '/', handle)

# get port for gomoku
port = int(os.environ.get('PORT', 5000))
web.run_app(app, port=port)