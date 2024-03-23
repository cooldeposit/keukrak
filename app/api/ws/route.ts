export function SOCKET(
  client: import("ws").WebSocket,
  _request: import("http").IncomingMessage,
  server: import("ws").WebSocketServer
) {
  console.log("A client connected!");

  client.on("message", (payload) => {
    server.clients.forEach((receiver) => {
      if (receiver === client) return;
      receiver.send(payload);
    });
  });

  client.on("close", () => {
    console.log("A client disconnected!");
  });
}
