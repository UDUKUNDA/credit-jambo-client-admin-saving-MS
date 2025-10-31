import 'dotenv/config';

const PORT = process.env.PORT || 5000;
export const WELCOME_MESSAGE = `Welcome to Credit Jambo API APP \n Access our Endpoint at http://localhost:${PORT}/api/v2`;
export const SERVER_RUNNING_MESSAGE = `Server is running on http://localhost:${PORT}`;
export const DEBUG_ERROR_MESSAGE = 'An Error occured'