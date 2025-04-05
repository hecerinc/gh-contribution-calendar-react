// src/App.tsx

import React from 'react';
// import ContributionGraph from './ContributionGraph';
import results2024 from '../public/results_2024.json';
import { ContributionData, ContributionGraphGH as ContributionGraph } from './ContributionGraphGH';

const App: React.FC = () => {
	// Sample data for contributions (365 days)
	// const sampleContributions = new Array(365).fill(0).map((_, index) => {
	// 	return Math.floor(Math.random() * 30); // Random number of contributions for each day
	// });
	const processedResults2024: Map<string, ContributionData> = React.useMemo(() => {
		return new Map(results2024.map((obj) => [obj['effective.date'], obj]));
	}, [results2024]);

	return (
		<div className="App">
			<ContributionGraph data={processedResults2024} />
		</div>
	);
};

export default App;
