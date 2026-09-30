import axios from "axios";
import { graph } from "../graph/graph.js";
import { addMessage } from "../config/memory.js";
import redis from "../shared/redis/redis.js";
import { detectAgent } from "../config/detectAgent.js";

export const agent = async (req, res, io) => {
    try {
        const {prompt, conversationId, agent} = req.body
        const file=req.file
        

        const userId = req.headers["x-user-id"]

        try {
            await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
                conversationId,
                role: "user",
                content: prompt
            });
        } catch (saveErr) {
            console.error("Failed to save user message to chat service:", saveErr.message || saveErr);
        }

        const requiredAgent = await detectAgent(prompt)
        console.log(requiredAgent)
        if (agent !== requiredAgent) {
            console.log("not matched")
            io.emit("agentMismatch", {
                message: "choose the required agent",
                requiredAgent: requiredAgent,
                currentAgent: agent
            })
            return
            
        }

        const result = await graph.invoke({
            prompt, conversationId, agent, userId, file
        })
        
        const response = result.aiResponse
        await addMessage(conversationId, "user", prompt)
        await addMessage(conversationId, "assistant", response)

        try {
            await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
                conversationId,
                role: "assistant",
                content: response,
                images: result.images,
                artifacts: result?.artifacts
            });
        } catch (saveErr) {
            console.error("Failed to save assistant message to chat service:", saveErr.message || saveErr);
        }

        return res.status(200).json({
            answer: result.aiResponse,
            images: result.images,
            artifacts: result.artifacts
        })


    } catch (error) {
    next(error)
}
}