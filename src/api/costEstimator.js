/**
 * Travel Cost Estimator Utility
 * Calculates estimated fuel consumption and total travel cost based on distance and vehicle type.
 */

const VEHICLE_AVERAGE_MILEAGE = {
    car: 20, // km per liter (Indian Avg)
    bike: 50, // km per liter (Indian Avg)
    truck: 4, // km per liter (Indian Avg)
    van: 14   // km per liter (Indian Avg)
};

/**
 * Calculates the travel cost.
 * @param {number} distanceKm - Total distance in kilometers.
 * @param {string} vehicleType - Type of vehicle (car, bike, etc.)
 * @param {number} fuelPricePerLiter - Price of fuel per liter.
 * @returns {object} - Object containing estimated fuel needed and total cost.
 */
export function calculateTravelCost(distanceKm, vehicleType, fuelPricePerLiter) {
    const mileage = VEHICLE_AVERAGE_MILEAGE[vehicleType.toLowerCase()] || VEHICLE_AVERAGE_MILEAGE.car;
    const fuelNeeded = distanceKm / mileage;
    const totalCost = fuelNeeded * fuelPricePerLiter;

    return {
        fuelNeeded: fuelNeeded.toFixed(2),
        totalCost: totalCost.toFixed(2),
        mileage: mileage
    };
}
