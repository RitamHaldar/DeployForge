import "dotenv/config"

export const config = {
    NVIDIAKEY : process.env.NVIDIA_API_KEY || "",
    MISTRALKEY : process.env.MISTRAL_API_KEY || "",
}