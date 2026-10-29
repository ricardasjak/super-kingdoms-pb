export function calculateExplorationQueue(
	currentQueue: number[] | undefined,
	requestedLand: number,
	ticks = 24,
): number[] {
	const safeQueue = currentQueue ? [...currentQueue] : [];

	while (safeQueue.length < ticks) {
		safeQueue.push(0);
	}

	if (requestedLand <= 0) return safeQueue;

	const perTick = Math.floor(requestedLand / ticks);
	let remainder = requestedLand % ticks;

	for (let i = 0; i < ticks; i++) {
		safeQueue[i] += perTick;
	}

	let backIndex = ticks - 1;
	while (remainder > 0 && backIndex >= 0) {
		safeQueue[backIndex] += 1;
		remainder--;
		backIndex--;
	}

	return safeQueue;
}
