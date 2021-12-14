import { CONFIG } from "../../config";

export abstract class FileHelper {

    public static getUrl(fileName: string, dir: 'app' | 'static'): string {

        let filesDir: string;

        switch (dir) {
            case 'app':
                filesDir = CONFIG.FILES_APP_DIR;
                break;
            case 'static':
                filesDir = CONFIG.FILES_STATIC_DIR;
                break;
        }

        return `${CONFIG.PUBLIC_ADDRESS}/${filesDir}/${fileName}`;
    }

    public static getFilePath(fileName: string, dir: 'app' | 'static' = 'app'): string {

        let filesDir: string;

        switch (dir) {
            case 'app':
                filesDir = CONFIG.FILES_APP_DIR;
                break;
            case 'static':
                filesDir = CONFIG.FILES_STATIC_DIR;
                break;
        }

        return `${filesDir}/${fileName}`;
    }
}