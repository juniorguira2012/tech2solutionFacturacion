export declare class DatabaseService {
    private readonly logger;
    handleAutomaticBackup(): Promise<void>;
    generateBackupFile(): Promise<string>;
    uploadToNextcloud(filePath: string): Promise<void>;
}
