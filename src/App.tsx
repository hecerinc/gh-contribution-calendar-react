// src/App.tsx

import React from 'react';
// import ContributionGraph from './ContributionGraph';
import { ContributionGraphGH as ContributionGraph } from './ContributionGraphGH';

const App: React.FC = () => {
	// Sample data for contributions (365 days)
	// const sampleContributions = new Array(365).fill(0).map((_, index) => {
	// 	return Math.floor(Math.random() * 30); // Random number of contributions for each day
	// });

	return (
		<div className="App">
			<ContributionGraph />
		</div>
	);
};

export default App;
