import { Strategy as GoogleStratagey } from "passport-google-oauth20";
import { config } from "./cofig.js";

/**
 * Configured with Client ID, Client Secret, Callback URL, and requested Scopes.
 * Handles the OAuth verification callback by passing the fetched Google profile forward.
 */
export const stratagey = new GoogleStratagey(
    {
        clientID: config.googleClientId,
        clientSecret: config.googleClientSecret,
        callbackURL: "/api/auth/google/callback",
        scope: ["profile", "email"],
    },
    (accessToken, refreshToken, profile, done) => {
        // Forward the authenticated profile to the route handler / controller
        return done(null, profile);
    }
);