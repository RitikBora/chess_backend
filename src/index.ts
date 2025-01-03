import {WebSocket} from 'ws'

export type GameRoom = {
    id: string,
    player1?: Player
    player2?: Player,
    turn: "w"| "b",
}

export type Player = {
  color : 'w' | 'b',
  socket : WebSocket
}

const wss = new WebSocket.Server({ port: 8083 });

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
      case "start":
        startGame(data.room_id);
    }

  });

  ws.on('close', () => {
   
  });
});

const connectToRoom = (room_id : string , ws : WebSocket) =>
{
  let room : GameRoom | undefined  = gameRooms.find((room) => room.id === room_id);
  

  if(room) //second player joining;
  {
    room.player2 = {
      color: 'b',
      socket : ws,
    }

    ws.send(JSON.stringify({action : "player_connected" , isPlayer1: false}));

  }else //first player joining
  {
    room = {
      id: room_id,
      turn: "w",
      player1 : {
        color : 'w',
        socket : ws,
      }
    }

    ws.send(JSON.stringify({action : "player_connected" , isPlayer1: true}));

    gameRooms.push(room);
    

    
  }

  if(room.player1  && room.player2){
      gameReady(room);
    }

}

const makeMove = (room_id : string , ws : WebSocket , from : string , to : string) =>
{

  const existingRoom = gameRooms.find((room) => room.id === room_id);
  
  if(existingRoom)
  {
      const p1Socket = existingRoom.player1?.socket;
      const p2Socket = existingRoom.player2?.socket;
      if(ws === p1Socket)
      {
        p2Socket?.send(JSON.stringify({action: "move" , from : from , to : to}));
        
      }else if( ws === p2Socket)
      {
        p1Socket?.send(JSON.stringify({action: "move" , from : from , to : to}));

      }
    
  }
}

const startGame = (room_id : string) =>
{
    const room =  gameRooms.find((room) => room.id === room_id);
    if(room)
    {
      const p1Socket = room.player1?.socket;
      const p2Socket = room.player2?.socket;



      if(p1Socket)
      {
        p1Socket.send(JSON.stringify({action : "start" , name : "player1" , turn : room.turn}));
      }

      if(p2Socket)
      {
        p2Socket.send(JSON.stringify({action : "start" , name : "player2" , turn : room.turn}));
      }
    }
    
}

const gameReady =  (room : GameRoom) =>
{
  const p1Socket = room.player1?.socket;
    const p2Socket = room.player2?.socket;

    if(p1Socket)
    {
      p1Socket.send(JSON.stringify({action : "ready" , name : "player1" , turn : room.turn}));
    }

    if(p2Socket)
    {
      p2Socket.send(JSON.stringify({action : "ready" , name : "player2" , turn : room.turn}));
    }
}

