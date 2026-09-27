import "dotenv/config"

export const config = {
    MONGO_URI: process.env.MONGO_URI || "",
    JWT: process.env.JWT_TOKEN || "",
    NVIDIAKEY: process.env.NVIDIA_API_KEY || "",
    MISTRALKEY: process.env.MISTRAL_API_KEY || "",
}