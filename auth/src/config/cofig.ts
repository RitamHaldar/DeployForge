import "dotenv/config";
export const config = {
    /** Secret key used for signing and verifying JSON Web Tokens (JWT) */
    key: process.env.JWT_SECRET || "",

    /** MongoDB connection URI string */
    uri: process.env.MONGO_URI || "",

    /** Google OAuth 2.0 Client ID */
    googleClientId: process.env.clientID || "",

    /** Google OAuth 2.0 Client Secret */
    googleClientSecret: process.env.clientSecret || "",
};