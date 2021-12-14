import { UploadedFile } from "express-fileupload";
import { injectable } from "inversify";
import { v4 as uuidV4 } from 'uuid';
import { FileHelper } from "../common/helpers/file.helper";
import { unlinkSync as deleteFile } from 'fs';

@injectable()
export class FileService {

    public async save(file: UploadedFile): Promise<string> {

        const fileName = `${uuidV4()}.${file.name.split('.').pop()}`;
        await file.mv(FileHelper.getFilePath(fileName, 'app'));

        return fileName;
    }

    public delete(filePath: string): void {
        try {
            deleteFile(filePath);
        }
        catch {
            
        }
    }
}