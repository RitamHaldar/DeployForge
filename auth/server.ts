/**
 * Server Entry Point
 * Initializes database connection and starts the HTTP server on specified port.
 */

import app from "./src/app.js";
import { connecttodb } from "./src/config/db.js";

const PORT = process.env.PORT || 3000;

// Connect to MongoDB database, then launch Express HTTP listener
connecttodb()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to database:", err);
        process.exit(1);
    });