/**
 * Rounds a number to a specified number of decimal places.
 * @param value The value to round.
 * @param decimals The number of decimal places (default 1).
 * @returns The rounded number.
 */
export function roundTo(value: number, decimals = 1): number {
	const factor = 10 ** decimals;
	return Math.round(value * factor) / factor;
}

/**
 * Calculates a percentage and rounds it to a specified number of decimal places.
 * @param part The part value.
 * @param total The total value.
 * (part / total) * 100
 */
export function calculatePercentage(
	part: number,
	total: number,
	decimals = 1,
): number {
	if (total <= 0) return 0;
	return roundTo((part / total) * 100, decimals);
}
