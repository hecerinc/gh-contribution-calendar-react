import React from 'react';
import { DateTime } from 'luxon';
import { Tooltip } from '@fluentui/react-components';

function getRandomInt(min, max) {
	const minCeiled = Math.ceil(min);
	const maxFloored = Math.floor(max);
	return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

// Generate 7-day week labels (Monday to Sunday)
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Generate month labels
const monthsFull = [
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
const getMonths = (startIndex: number): number[] => {
	const result: number[] = [];

	for (let i = 0, j = startIndex; i < 13; i++) {
		result.push(j);
		j = (j + 1) % monthsFull.length;
	}
	return result;
};

const WEEKS_TO_SHOW = 53; // 52 weeks in a year + the current one
const currentDate = DateTime.now();

// FOR TESTING:
// const currentDate = DateTime.local(2025, 3, 30);

// -52 weeks
// let START_DATE = DateTime.fromJSDate(new Date(currentDate.toMillis() - 52 * 7 * 24 * 60 * 60 * 1000));
let START_DATE = DateTime.fromISO('2024-01-01');

// TODO: change this to localWeekday -1
if (START_DATE.weekday !== 7 /* Sunday */) {
	// Start the week on Sunday
	// by default Luxon starts it on Monday, so startOf('week') returns the monday of that week
	START_DATE = START_DATE.startOf('week').minus({ days: 1 });
}

// const formattedDate = pastDate.toLocaleDateString();
// console.log('52 weeks ago!', formattedDate);

// Given some value for contribution, return correct level (bins the data)
const map2Level = (val: number | undefined): number => {
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
const renderWeeksRow = (dowIndex: number, data: Map<string, ContributionData>) => {
	return Array.from({ length: WEEKS_TO_SHOW }, (_v, i) => i).map((weekIndex) => {
		const daysToAdd = weekIndex * 7 + dowIndex;
		const day = START_DATE.plus({ days: daysToAdd });
		let shouldRender = true;
		if (weekIndex === WEEKS_TO_SHOW - 1) {
			// handle the case for the current week (only render up to today)
			const twd: number = currentDate.weekday === 7 ? 0 : currentDate.weekday;
			if (day > currentDate) {
				shouldRender = false;
			}
		}

		const cardinality = data.get(day.toISODate()!)?.cardinality;

		return shouldRender ? (
			<Tooltip
				withArrow
				appearance="inverted"
				content={day.toISODate() + ` (${cardinality ?? 0})`}
				relationship="label"
				key={`doy-${dowIndex}-${weekIndex}`}
			>
				<td
					// tabIndex={weekIndex == 0 ? 0 : -1}
					tabIndex={0}
					data-ix={weekIndex}
					aria-selected="false"
					// title={String(daysToAdd)}
					title={day.toISODate() ?? ''}
					aria-describedby="contribution-graph-legend-level-2"
					style={{ width: 10 }}
					data-date={day.toISODate()}
					id={`contribution-day-component-${dowIndex}-${weekIndex}`}
					data-level={map2Level(cardinality)} // depth (color scale)
					// data-level={getRandomInt(0, 4 + 1)} // depth (color scale)
					role="gridcell"
					className="ContributionCalendar-day"
					aria-labelledby="tooltip-94c39a0d-505f-494b-877b-47ae02f4aaf8"
				/>
			</Tooltip>
		) : null;
	});
};

/*
 * Given the first day of a week, it will calculate and return
 * an array of spans 12 + 1 spans (integers) for the month labels at the top.
 */
const calcMonthWeekSpans = (startOfWeek: DateTime): number[] => {
	// The rule to follow here is basically whatever the first day of the week's month is,
	// we will declare that entire week as belonging to that month, even if it changes midweek.

	// TODO: actually, I think the rule is slightly more complex, in that it will take the month with
	// majority dates in the week, so if Sunday is 3/31, then that week will be labeled Apr, not Mar
	const result: number[] = [];
	let j = 0;
	for (let currMonth = startOfWeek.month - 1, weekIterator = startOfWeek, i = 0; i < WEEKS_TO_SHOW; i++) {
		if (currMonth !== weekIterator.month - 1) {
			currMonth = weekIterator.month - 1;
			result.push(j);
			j = 1;
		} else {
			j++;
		}
		weekIterator = weekIterator.plus({ days: 7 });
	}
	result.push(j);
	return result;
};

const COL_SPANS = calcMonthWeekSpans(START_DATE);

// - 1 because luxon is not 0-based months like JS
let currentMonthIndex = START_DATE.month - 1;
export type ContributionData = { cardinality?: number; amount?: number; 'effective.date'?: string };
interface ContributionGraphGHProps {
	data: Map<string, ContributionData>;
}
export const ContributionGraphGH: React.FC<ContributionGraphGHProps> = ({ data }) => {
	return (
		<div className="ContributionGraph">
			<div className="border py-2 graph-before-activity-overview">
				<div className="js-calendar-graph mx-md-2 mx-3 d-flex flex-column flex-items-end flex-xl-items-center overflow-hidden pt-1 is-graph-loading graph-canvas ContributionCalendar height-full text-center">
					<div style={{ maxWidth: '100%', overflowY: 'hidden', overflowX: 'auto' }}>
						{/*<Tooltips />*/}
						<table
							role="grid"
							aria-readonly="true"
							className="ContributionCalendar-grid js-calendar-graph-table"
							style={{ borderSpacing: '3px', overflow: 'hidden', position: 'relative' }}
						>
							<caption className="sr-only">Contribution Graph</caption>
							<thead>
								<tr style={{ height: '13px' }}>
									<td style={{ width: '28px' }}>
										<span className="sr-only">Day of Week</span>
									</td>

									{getMonths(currentMonthIndex).map((t: number, i) => (
										<td
											key={i}
											className="ContributionCalendar-label"
											colSpan={COL_SPANS[i]}
											style={{ position: 'relative' }}
										>
											<span className="sr-only">{monthsFull[t]}</span>
											<span aria-hidden="true" style={{ position: 'absolute', top: 0 }}>
												{monthsFull[t].substring(0, 3)}
											</span>
										</td>
									))}
								</tr>
							</thead>
							<tbody>
								{Array.from({ length: weekdays.length }, (_v, i) => i).map((dowIndex) => {
									return (
										<tr style={{ height: '10px' }} key={`dow-${dowIndex}`}>
											<td className="ContributionCalendar-label" style={{ position: 'relative' }}>
												<span className="sr-only">{weekdays[dowIndex]}</span>
												<span
													aria-hidden="true"
													style={{
														clipPath: dowIndex % 2 !== 0 ? 'None' : 'Circle(0)',
														position: 'absolute',
														bottom: '-3px',
													}}
												>
													{weekdays[dowIndex].substring(0, 3)}
												</span>
											</td>
											{renderWeeksRow(dowIndex, data)}
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
};
