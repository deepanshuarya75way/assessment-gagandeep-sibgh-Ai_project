import express from "express"
import { agent } from "../controllers/agent.controller.js";
import multer from "../config/multer.js";

const router = express.Router()

// Wrap the route definition in a function exported to index.js
export default function(io) {
    // Pass a callback function that routes the request and io to the controller
    router.post("/chat", multer.single("file"), (req, res) => agent(req, res, io))
    
    return router;
}
