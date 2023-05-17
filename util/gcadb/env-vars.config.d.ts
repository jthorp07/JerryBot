declare const _default: {
    SQL: {
        user: string;
        password: string;
        database: string;
        server: string;
        pool: {
            max: number;
            min: number;
            idleTimeoutMillis: number;
        };
        options: {
            encrypt: boolean;
            trustServerCertificate: boolean;
        };
    };
    ADMINS: string[];
};
export default _default;
