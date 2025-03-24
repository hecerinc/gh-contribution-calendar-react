// src/components/ContributionGraph.tsx

import React from 'react';
import './ContributionGraph.css';

interface ContributionGraphProps {
	contributions: number[]; // An array of contributions for each of the 365 days
}


const ContributionGraph: React.FC<ContributionGraphProps> = ({ contributions }) => {
	// Colors based on contributions
	const getColorForContributions = (contributionCount: number) => {
		if (contributionCount === 0) return '#ebedf0';
		if (contributionCount <= 10) return '#c6e48b';
		if (contributionCount <= 20) return '#7bc96f';
		if (contributionCount <= 30) return '#239a3b';
		return '#196127';
	};

	// Generate 7-day week labels (Monday to Sunday)
	const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

	// Generate month labels
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	// Calculate days in each month (simplified for this example)
	const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // Days in each month (non-leap year)

	// Calculate the total number of rows (7 days per row)
	const rows = 7; // 7 rows for weekdays (Mon-Sun)

	// Generate the days of each month into a weekly column format
	const generateMonthData = (startDay: number, daysInMonth: number) => {
		let monthData: (number | null)[] = [];
		for (let i = 0; i < daysInMonth; i++) {
			monthData.push(contributions[startDay + i] || 0);
		}
		// Fill up to fit 7 rows per column (by adding empty days)
		while (monthData.length < 35) {
			monthData.push(null); // Add empty space if the month has less than 35 days
		}
		return monthData;
	};

	// Contribution Graph rendering
	return (
		<div className="contribution-graph-wrapper">
			<div className="contribution-graph">
				{/* Month labels (horizontal axis) */}
				<div className="month-labels">
					{months.map((month, index) => (
						<div className="month-label" key={index}>
							{month}
						</div>
					))}
				</div>

				{/* Grid for the 365 days */}
				<div className="grid">
					{/* Weekday labels (vertical axis) */}
					<div className="weekday-labels">
						{weekdays.map((day, index) => (
							<div className="weekday-label" key={index}>
								{day}
							</div>
						))}
					</div>

					{/* Grid body for the 365 days */}
					<div className="grid-body">
						{months.map((_, monthIndex) => {
							const startDay = daysInMonth.slice(0, monthIndex).reduce((acc, days) => acc + days, 0); // Calculate the start day for the month
							const monthData = generateMonthData(startDay, daysInMonth[monthIndex]);

							return (
								<div key={monthIndex} className="grid-column">
									{/* Render each week's days for the month */}
									{Array.from({ length: rows }).map((_, rowIndex) => (
										<div key={rowIndex} className="grid-row">
											{/* Render the days for each row */}
											{Array.from({ length: 5 }).map((_, colIndex) => {
												const dayIndex = rowIndex + colIndex * rows;
												if (dayIndex < monthData.length && monthData[dayIndex] !== null) {
													return (
														<div
															key={colIndex}
															className="contribution-day"
															style={{
																backgroundColor: getColorForContributions(monthData[dayIndex] || 0),
															}}
														/>
													);
												}
												return <div key={colIndex} className="contribution-day empty" />;
											})}
										</div>
									))}
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ContributionGraph;
