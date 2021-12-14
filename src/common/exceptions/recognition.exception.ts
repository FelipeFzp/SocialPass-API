import { CustomException } from "./setup/custom.exception";

export class RecognitionException extends CustomException {

    constructor(message = 'Erro no serviço de reconhecimento', statusCode = 400) {
        super(statusCode, message);
    }
}