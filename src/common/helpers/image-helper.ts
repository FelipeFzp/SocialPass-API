// import * as marvinj from 'marvinj';
import * as imageAverageColor from 'image-average-color';

export abstract class ImageHelper {

    private static async getAverageColor(imageUrl: string): Promise<number[]> {
        return new Promise((resolve, reject) => {

            imageAverageColor(imageUrl, (err, color) => {
                if (err) throw err;
                const [r, g, b] = color;
                resolve([r, g, b]);
            });

            // console.log('#####', marvinj);

            // const image = new marvinj.MarvinImage();

            // image.load(imageUrl, () => {
            //     const averageColor = marvinj.Marvin.averageColor(image);
            //     resolve(averageColor);
            // });
        });
    }

    private static calculeContrastColor(rgb: number[]): string {
        const brightnessFactor = rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] + 0.114
        return brightnessFactor > 350 ? '#0e0e0e' : '#ffffff';
    }


    public static async getHexContrastColor(imagePathOrColorRgb: string | number[]): Promise<string> {

        let color: string;
        if (Array.isArray(imagePathOrColorRgb)) {
            color = ImageHelper.calculeContrastColor(imagePathOrColorRgb);
        } else {
            const rgbColor = await ImageHelper.getAverageColor(imagePathOrColorRgb);
            color = ImageHelper.calculeContrastColor(rgbColor);
        }

        return color;
    }
}