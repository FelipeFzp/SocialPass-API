import { Coordinates } from "../../models/others/coordinates";

export abstract class CoordinatesHelper {

    public static isInside(center: Coordinates, spot: Coordinates, radius: number) {

        const newRadius = CoordinatesHelper.distanceInKmBetweenEarthCoordinates(spot, center);
        return newRadius <= radius;
    }

    public static distanceInKmBetweenEarthCoordinates(coordinates1: Coordinates, coordinates2: Coordinates) {
        var earthRadiusKm = 6371;

        var dLat = CoordinatesHelper.degreesToRadians(coordinates2.latitude - coordinates1.latitude);
        var dLon = CoordinatesHelper.degreesToRadians(coordinates2.longitude - coordinates2.longitude);

        coordinates1.latitude = CoordinatesHelper.degreesToRadians(coordinates1.latitude);
        coordinates2.latitude = CoordinatesHelper.degreesToRadians(coordinates2.latitude);

        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(coordinates1.latitude) * Math.cos(coordinates2.latitude);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadiusKm * c;
    }

    public static calculeMinMax(coords: Coordinates, radius: number): { min: Coordinates, max: Coordinates } {

        const R = 6371;

        const longMin = coords.longitude - CoordinatesHelper.radiansToDegrees(radius / R / Math.cos(CoordinatesHelper.degreesToRadians(coords.latitude)));
        const longMax = coords.longitude + CoordinatesHelper.radiansToDegrees(radius / R / Math.cos(CoordinatesHelper.degreesToRadians(coords.latitude)));

        const latMax = coords.latitude + CoordinatesHelper.radiansToDegrees(radius / R);
        const latMin = coords.latitude - CoordinatesHelper.radiansToDegrees(radius / R);

        return {
            min: { latitude: latMin, longitude: longMin },
            max: { latitude: latMax, longitude: longMax }
        };
    }

    private static degreesToRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    private static radiansToDegrees(radians) {
        return radians * (180 / Math.PI);
    }
}


// function calculeMinMax(coords, radius) {

//     function radiansToDegrees(radians)
//     {
//       return radians * (180/Math.PI);
//     }   

//    function degreesToRadians(degrees) {
//         return degrees * Math.PI / 180;
//     }

//      const R = 6371;

//     const longMin = coords.longitude - radiansToDegrees(radius/R/Math.cos(degreesToRadians(coords.latitude)));
//     const longMax = coords.longitude + radiansToDegrees(radius/R/Math.cos(degreesToRadians(coords.latitude)));
//     const latMax = coords.latitude + radiansToDegrees(radius/R);
//     const latMin = coords.latitude - radiansToDegrees(radius/R);

//     return {
//         arr: [latMin, longMin, latMax, longMax],
//         min: {latitude: latMin, longitude: longMin},
//         max: {latitude: latMax, longitude: longMax}
//     };
// }