import { DateTime } from 'luxon';

export const WEEKS_TO_SHOW = 53; // 52 weeks in a year + the current one

// Transform 1-12 month indexing into JS indexing (0-11)
const dt2JsMonth = (monthNum: number): number => {
	const num = monthNum % 12;
	if (num === 0) {
		return 11; // December (in JS notation)
	}
	return num - 1;
};

/**
 *
 * Given the first day of the week (assumes it's a Sunday), it will calculate
 * the majority month of that week (i.e. for what month do most dates in that week
 * correspond to?). The calc is very simple, if Sunday's month == Wednesday's month, then
 * 4/7 days are Sunday's month, so a majority, so returns current month. Else return next month.
 * @param dt the date representing the week for which to calculate the majority month
 * @returns the _JS_ month index (JS months are 0-based i.e. Jan == 0)
 */
export const calcMajorityMonth = (dt: DateTime): number => {
	const currmonth: number = dt.month;
	const wedmonth: number = dt.plus({ days: 3 }).month;
	if (currmonth === wedmonth) {
		return dt2JsMonth(currmonth);
	}
	return dt2JsMonth(currmonth + 1);
};

/**
 * Given the first day of a week, it will calculate and return
 * an array of spans 12 + 1 spans (integers) for the month labels at the top.
 */
export const calcMonthWeekSpans = (startOfWeek: DateTime): number[] => {
	const result: number[] = [];
	let j = 0;
	for (let currMonth = calcMajorityMonth(startOfWeek), weekIterator = startOfWeek, i = 0; i < WEEKS_TO_SHOW; i++) {
		const majorityMonthForWeek: number = calcMajorityMonth(weekIterator);
		if (currMonth !== majorityMonthForWeek) {
			currMonth = majorityMonthForWeek;
			result.push(j);
			j = 1;
		} else {
			j++;
		}
		weekIterator = weekIterator.plus({ days: 7 });
	}
	return result;
};

// Generate 7-day week labels (Monday to Sunday)
export const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Generate month labels
export const monthsFull = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];
/**
 * Gets an array of numbers with which to index the `monthsFull` collection
 * based on what we want to show (a full year)
 */
export const getMonths = (startIndex: number): number[] => {
	const result: number[] = [];

	for (let i = 0, j = startIndex; i < 13; i++) {
		result.push(j);
		j = (j + 1) % monthsFull.length;
	}
	return result;
};

// Given some value for contribution, return correct level (bins the data)
export const map2Level = (val: number | undefined): number => {
	if (val === undefined) {
		return 0;
	}
	switch (true) {
		case val <= 5:
			return 1;
		case val > 5 && val <= 10:
			return 2;
		case val > 10 && val <= 15:
			return 2;
		case val > 15 && val <= 20:
			return 3;
		case val > 20:
			return 4;
		default:
			return 0;
	}
};
