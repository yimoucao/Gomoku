import os
import asyncio
import json
from aiohttp import web
from player import PlayerAgent

import settings
from game import Game

async def handle(request):
    ALLOWED_FILES = ["index.html", "style.css"]
    name = request.match_info.get('name', 'index.html')
    if name in ALLOWED_FILES:
        try:
            with open(name, 'rb') as index:
                return web.Response(body=index.read(), content_type='text/html')
        except FileNotFoundError:
            pass
    return web.Response(status=404)


async def wshandler(request):
    print("Connected")
    app = request.app
    ws = web.WebSocketResponse()
    await ws.prepare(request)

    playerAgent = None
    while True:
        msg = await ws.receive()
        if msg.tp == web.MsgType.text:
            print("Got message {}".format(msg.data))

            data = json.loads(msg.data)
            # if type(data) == int and player:
            #     # Interpret as key code
            #     player.keypress(data)
            if type(data) != list:
                continue

            # player is not there
            if not playerAgent:
                if data[0] == "new_player":
                    playerAgent = PlayerAgent(data[1].strip(), ws)
                    playerAgent.initialHandshake()
                    playerAgent.sendGamesList(app["games"])

                    # player = game.new_player(data[1], ws)
            else: # player is there
                if data[0] == "new_game":
                    game = Game(playerAgent) # open a new game add the player into the game
                    app["games"].append(game)
                    playerAgent.sendGameAck(game)
                    PlayerAgent.sendAllGamesList(app["games"])

                if data[0] == "join_game":
                    # get game obj
                    game = getGameInList(int(data[1]))
                    # TODO: if game is None, send errmsg to player
                    game.addPlayer(playerAgent)

                if data[0] == "new_move":
                    from_player = PlayerAgent.getMapping(ws)
                    game = Game.getMapping(from_player)
                    game.sendMove(data[1], from_player)

                if data[0] == "I_win":
                    # TODO: the server must validate if the user does win
                    from_player = PlayerAgent.getMapping(ws)
                    game = Game.getMapping(from_player)
                    game.sendFinish(from_player, normal=True) # game_finish, you_win, you_lose
                    # game.emptyPlayers()
                    # removeGameInList(game)

                if data[0] == "left_game":
                    quitor = PlayerAgent.getMapping(ws)
                    game = Game.getMapping(quitor)
                    if game:
                        # if game.isOn():
                        game.sendLeave(quitor)
                        # else:
                        game.emptyPlayers()
                        removeGameInList(game)
                    else: # the quitor might be a watcher
                        game = Game.getWatchersMapping(quitor)
                        game.removeWatcher(quitor) if game else None
                    PlayerAgent.sendAllGamesList(app["games"])
                    # quitor.sendGamesList(app["games"])


        elif msg.tp == web.MsgType.close:
            offliner = PlayerAgent.getMapping(ws)
            game = Game.getMapping(offliner)
            if game:
                # if game.isOn():
                print("going to send offline")
                game.sendOffline(offliner)
                # else:
                game.emptyPlayers()
                removeGameInList(game)
            else:  # the offliner might be a watcher
                game = Game.getWatchersMapping(offliner)
                game.removeWatcher(offliner) if game else None

            PlayerAgent.popMapping(ws)
            PlayerAgent.sendAllGamesList(app["games"])
            break

    # if player:
    #     game.player_disconnected(player)

    print("Closed connection")
    return ws

# async def game_loop(game):
#     game.running = True
#     while 1:
#         game.next_frame()
#         if not game.count_alive_players():
#             print("Stopping game loop")
#             break
#         await asyncio.sleep(1./settings.GAME_SPEED)
#     game.running = False

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