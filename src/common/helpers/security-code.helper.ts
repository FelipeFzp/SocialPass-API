export abstract class SecurityCodeHelper {

    public static generate(numberOfDigits: number): string {
        let securityCode = "";
        for (let i = 0; i < numberOfDigits; i++) {
            securityCode += Math.floor(Math.random() * 9).toString();
        }

        return securityCode;
    }
}