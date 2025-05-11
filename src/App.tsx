// src/App.tsx

import React from 'react';
// import ContributionGraph from './ContributionGraph';
import results2024 from '../public/results_2024.json';
import { ContributionData, ContributionGraphGH as ContributionGraph } from './ContributionGraphGH';
import { DateTime } from 'luxon';

const App: React.FC = () => {
	// const startDate = DateTime.fromISO('2024-05-27');
	const [startDate, setStartDate] = React.useState<DateTime | undefined>();
	// Sample data for contributions (365 days)
	// const sampleContributions = new Array(365).fill(0).map((_, index) => {
	// 	return Math.floor(Math.random() * 30); // Random number of contributions for each day
	// });
	const processedResults2024: Map<string, ContributionData> = React.useMemo(() => {
		return new Map(results2024.map((obj) => [obj['effective.date'], obj]));
	}, [results2024]);

	return (
		<div className="App">
			<div className="flex">
				<label className="startDateLabel">
					Start date
					<input
						className="startDatePicker"
						type="date"
						name="startDate"
						value={startDate?.toFormat('yyyy-MM-dd') ?? ''}
						onChange={(e) => {
							const newVal = e.target.value;
							const dt = DateTime.fromISO(newVal);
							setStartDate(dt);
						}}
					/>
				</label>
				<button
					type="button"
					onClick={() => {
						setStartDate(undefined);
					}}
				>
					Clear date
				</button>
			</div>
			<ContributionGraph startDate={startDate} data={processedResults2024} />
		</div>
	);
};

export default App;
