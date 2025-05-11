import React from 'react';
import { DateTime } from 'luxon';
import { Tooltip } from '@fluentui/react-components';
import { calcMajorityMonth, calcMonthWeekSpans, getMonths, map2Level, monthsFull, weekdays, WEEKS_TO_SHOW } from './graphLogicService';

// Upper bound:
const currentDate = DateTime.now();
// FOR TESTING:
// const currentDate = DateTime.local(2025, 3, 30);

// Lower bound:
// today - 52 weeks
// let START_DATE = DateTime.fromJSDate(new Date(currentDate.toMillis() - 52 * 7 * 24 * 60 * 60 * 1000));
// let START_DATE = DateTime.fromISO('2024-05-27');

const renderWeeksRow = (startDate: DateTime, dowIndex: number, data: Map<string, ContributionData>) => {
	return Array.from({ length: WEEKS_TO_SHOW }, (_v, i) => i).map((weekIndex) => {
		const daysToAdd = weekIndex * 7 + dowIndex;
		const day = startDate.plus({ days: daysToAdd });

		if (day > currentDate) {
			// Only render up to the current date
			return null;
		}

		const cardinality: number | undefined = data.get(day.toISODate()!)?.cardinality;

		return (
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
		);
	});
};

export type ContributionData = { cardinality?: number; amount?: number; 'effective.date'?: string };

interface ContributionGraphGHProps {
	data: Map<string, ContributionData>;
	/**
	 * the lower bound of the graph
	 * @default currentDate - 52 weeks
	 */
	startDate?: DateTime;
}

export const ContributionGraphGH: React.FC<ContributionGraphGHProps> = ({ data, startDate }) => {
	if (startDate === undefined) {
		startDate = currentDate.minus({ weeks: 52 });
	}
	// If the given START_DATE is not the start of the week (a Sunday)
	// then get the actual start of the week for whatever date we got passed
	// TODO: change this to localWeekday -1
	if (startDate.weekday !== 7 /* Sunday */) {
		// Start the week on Sunday
		// by default Luxon starts it on Monday, so startOf('week') returns the monday of that week
		startDate = startDate.startOf('week').minus({ days: 1 });
	}

	const currentMonthIndex: number = calcMajorityMonth(startDate);
	const colSpans: number[] = calcMonthWeekSpans(startDate);

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
							style={{ borderSpacing: '3px', position: 'relative' }}
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
											colSpan={colSpans[i]}
											style={{ position: 'relative' }}
										>
											<span className="sr-only">{monthsFull[t]}</span>
											<span aria-hidden="true" style={{ position: 'absolute', top: 0 }}>
												{/* As a special case, if the first week has a colspan=1 (because the month changes the week after that), then we just won't show it, because 1 column is not enough space to show the full label, so it overlaps with the next and looks ugly */}
												{i === 0 && colSpans[i] === 1 ? '' : monthsFull[t].substring(0, 3)}
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
											{renderWeeksRow(startDate, dowIndex, data)}
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
