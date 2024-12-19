import {WebSocket} from 'ws'

export type GameRoom = {
    id: string,
    player1?: WebSocket,
    player2?: WebSocket
}

const wss = new WebSocket.Server({ port: 8080 });

const gameRooms : GameRoom[] = [];

wss.on('connection', (ws : WebSocket) => {

  ws.on('message', (message : string) => {
    const data = JSON.parse(message);
    const action = data.action;

    switch(action)
    {
      case  "connect_room":
        connectToRoom(data.room_id , ws);
        break;
      case "move":
        makeMove(data.room_id , ws , data.from , data.to);
        break;
    }

  });

  ws.on('close', () => {
   
  });
});

const connectToRoom = (room_id : string , ws : WebSocket) =>
{
  const existingRoom = gameRooms.find((room) => room.id === room_id);

  if(existingRoom)
  {
    existingRoom.player2 = ws;
  }else
  {
    const newRoom : GameRoom = {
      id : room_id,
      player1: ws
    }

    gameRooms.push(newRoom);

  }
}

const makeMove = (room_id : string , ws : WebSocket , from : string , to : string) =>
{
  const existingRoom = gameRooms.find((room) => room.id === room_id);
 
  console.log(from + " " + to);
  
  if(existingRoom)
  {
     if(ws === existingRoom.player1)
     {
        existingRoom.player2?.send(JSON.stringify({from : "" , to : ""}));
     }else if(ws === existingRoom.player2)
     {
      existingRoom.player1?.send(JSON.stringify({from : "" , to : ""}))
     }
  }
}

