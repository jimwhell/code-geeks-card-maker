import cors from "cors";

const corsOptions = {
  origin: "http://localhost:4200",
  optionsSuccessStatus: 200,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
};

export default cors(corsOptions);
