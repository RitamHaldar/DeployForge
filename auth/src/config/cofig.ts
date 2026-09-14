import "dotenv/config";
export const config = {
    /** Secret key used for signing and verifying JSON Web Tokens (JWT) */
    key: process.env.JWT_SECRET || "",

    uri: process.env.MONGO_URI || "",

    googleClientId: process.env.GOOGLE_CLIENT_ID || "",

    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",

    CLIENT_ID:process.env.GITHUB_CLIENT_ID || "",
    
    CLIENT_SECRET:process.env.GITHUB_CLIENT_SECRET || "",
};