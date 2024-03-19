import initApp from "./app";
import https from "https";
import http, { Server } from "http";
import fs from "fs";
import swaggerUI from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import { Socket, Server as SocketServer } from "socket.io";
import { sendMessageToConversation } from "./services/chat.service";
import { verifyToken } from "./middlewares/auth_middleware";
import { isUserPartOfConversation } from "./middlewares/conversation_guard_middleware";

initApp().then((app) => {
  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Web Advanced Application development 2023 REST API",
        version: "1.0.1",
        description:
          "REST server including authentication using JWT and refresh token",
      },
      servers: [
        {
          url:
            process.env.NODE_ENV === "production"
              ? "https://localhost:" + process.env.HTTPS_PORT
              : "http://localhost:" + process.env.PORT,
        },
      ],
    },
    apis: ["./src/routes/*.ts"],
  };
  const specs = swaggerJsDoc(options);
  app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));
  app.use("*", (_, res) => {
    res.sendFile("client/index.html", { root: "public" });
  });
  let server: Server;
  let port: string;

  if (process.env.NODE_ENV !== "production") {
    console.log("development");
    port = process.env.PORT;
    server = http.createServer(app);
  } else {
    console.log("production");
    port = process.env.HTTPS_PORT;
    const options2 = {
      key: fs.readFileSync("./client-key.pem"),
      cert: fs.readFileSync("./client-cert.pem"),
    };
    server = https.createServer(options2, app);
  }

  server = server
    .listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    })
    .on("error", (err) => {
      console.error("Error creating HTTPS server:", err.message);
    });

  /************************************************************************************
   *                              Set socket io
   ***********************************************************************************/
  const io = new SocketServer({ cors: { origin: "*" } }).listen(server);

  async function addUserToSocketDataIfAuthenticated(
    socket: Socket,
    next: (err?: Error) => void
  ) {
    const token = socket.handshake.auth.token;
    verifyToken(token, (err, user) => {
      if (!err) {
        socket.data = { ...socket.data, userId: user._id };
        next();
      }
    });
  }

  io.use(addUserToSocketDataIfAuthenticated);

  io.on("connection", async (socket) => {
    console.log("[SOCKET LOG]: user connected to socket stream");

    socket.on("joinRoom", async (conversationId) => {
      const canJoinRoom = await isUserPartOfConversation(
        conversationId,
        socket.data.userId
      );

      if (canJoinRoom) {
        console.log(
          `[SOCKET LOG]: user has connected to room ${conversationId}`
        );
        socket.join(conversationId);
      } else {
        console.log(
          `[SOCKET LOG ERROR]: user has no access to connect to room ${conversationId}`
        );
      }
    });

    socket.on("sendMessage", async (data) => {
      const { conversationId, content } = data;
      console.log(`[SOCKET LOG]: user sent message to room ${conversationId}`);

      try {
        const newMessage = await sendMessageToConversation(
          conversationId,
          socket.data.userId,
          content
        );
        io.to(conversationId).emit("recieveMessage", {
          conversationId,
          id: newMessage.id,
          content: newMessage.content,
          createdAt: newMessage.createdAt,
          senderId: socket.data.userId,
        });
      } catch (err) {
        console.log(
          `[SOCKET LOG ERROR]: failed to send message to room ${conversationId}`
        );
        console.log(err);
      }
    });

    socket.on("disconnect", () => {
      console.log("[SOCKET LOG]: user has disconnected");
    });
  });
});
