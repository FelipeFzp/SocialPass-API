export const CONFIG: {
    HOST: string,
    PORT: number,

    PUBLIC_ADDRESS: string,

    DB_HOST: string,
    DB_PORT: number,
    DB_NAME: string,
    DB_USER: string,
    DB_PASSWORD: string,

    JWT_SECRET: string,

    LINKEDIN_CLIENT_ID: string,
    LINKEDIN_CLIENT_SECRET: string,

    FILES_APP_DIR: string,
    FILES_STATIC_DIR: string

} = process.env as any;