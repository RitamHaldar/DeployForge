export interface Iresponse {
    /** Indicates whether the operation succeeded or failed */
    success: boolean;

    /** Human-readable status message or error summary */
    message: string;

    /** Optional payload body containing returned data (e.g., user profile, tokens) */
    body?: object;

    /** Optional error object details when success is false */
    error?: object;
}