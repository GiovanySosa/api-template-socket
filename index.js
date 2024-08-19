const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors"); // Para la configuración de CORS
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const morgan = require("morgan");

const app = express();
const server = http.createServer(app);

// Configura Socket.IO sin path personalizado
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:8080", // Dominio del frontend
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

// Configuración CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Actualiza según el dominio de tu frontend
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

// Configura el servidor de Socket.IO
io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado:", socket.id);

  const events = ["En llamada", "Sin llamada", "Descanso"];
  let index = 0;

  const interval = setInterval(() => {
    console.log("Enviando evento:", events[index]);
    socket.emit("evento", { type: events[index] });
    index = (index + 1) % events.length;
  }, 30000); // Cada 5 segundos

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
    clearInterval(interval); // Limpia el intervalo al desconectar
  });
});

// Inicia el servidor
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
