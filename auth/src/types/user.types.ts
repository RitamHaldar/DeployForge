export interface IUsers {
    /** Unique display name / handle for the user */
    Username: string;

    /** Contact mobile number information (required for standard registrations) */
    Mobileno?: {
        /** Phone number without country code */
        Number: string;
        /** International country calling code (e.g., '+91', '+1') */
        CountryCode: string;
    };

    /** Primary email address associated with the account (unique across users) */
    Email: string;

    /** Google Identifier (UID) assigned when registered via Google OAuth */
    Oauthid?: string;

    GitHubAccessToken?:string;

    /** Bcrypt hashed password (optional for Google OAuth users, required for standard users) */
    Password?: string;

    /** Status flag indicating if the account/email has been verified */
    isVerified: boolean;
}