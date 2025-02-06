import React, { useEffect, useRef } from "react";
import { Bar, Doughnut, Pie, Line } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement, PointElement, LineElement } from "chart.js";

// Registering chart.js components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement, PointElement, LineElement);

const Chart = ({ data }) => {
	const { subjectWise, difficultyWise, timeSpentOnEachQuestion } = data;
	const chartRef = useRef([]);

	// Data for subject-wise performance
	const subjectLabels = Object.keys(subjectWise);
	const marksData = subjectLabels.map(subject => subjectWise[subject].marks);
	const accuracyData = subjectLabels.map(subject => subjectWise[subject].accuracy);
	const timeSpentData = subjectLabels.map(subject => subjectWise[subject].timeSpent);

	// Data for difficulty-wise performance
	const difficultyLabels = Object.keys(difficultyWise);
	const correctData = difficultyLabels.map(diff => difficultyWise[diff].correct);
	const incorrectData = difficultyLabels.map(diff => difficultyWise[diff].incorrect);
	const notAttemptedData = difficultyLabels.map(diff => difficultyWise[diff].notAttempted);

	// Data for time spent on each question
	const questionLabels = Object.keys(timeSpentOnEachQuestion);
	const timeSpentOnQuestionsData = questionLabels.map(question => timeSpentOnEachQuestion[question]);

	// Cleanup charts when data changes
	useEffect(() => {
		chartRef.current.forEach(chart => chart?.destroy());
		chartRef.current = [];
		return () => {
			chartRef.current.forEach(chart => chart?.destroy());
		};
	}, [data]);

	// Common chart options
	const commonOptions = {
		// responsive: true,
		plugins: {
			legend: { position: "top" },
		},
	};

	return (
		<div className="p-4 space-y-6">
			{/* Subject-Wise Performance */}
			<div className="bg-white p-4 rounded shadow-md">
				<h2 className="text-xl font-semibold mb-4">Subject-Wise Performance</h2>
				<div className="flex flex-col lg:flex-row gap-6">
					<div className="w-full lg:w-1/2">
						{/* Bar chart for Marks Obtained */}
						<Bar
							ref={el => {
								if (el?.chartInstance) {
									chartRef.current.push(el.chartInstance);
								}
							}}
							data={{
								labels: subjectLabels,
								datasets: [
									{
										label: "Marks Obtained",
										data: marksData,
										backgroundColor: "#34d399",
									},
								],
							}}
							options={commonOptions}
						/>
					</div>
					<div className="w-full lg:w-1/2">
						{/* Line chart for Time Spent with dual axis */}
						<Bar
							ref={el => {
								if (el?.chartInstance) {
									chartRef.current.push(el.chartInstance);
								}
							}}
							data={{
								labels: subjectLabels,
								datasets: [
									{
										label: "Time Spent (min)",
										data: timeSpentData,
										backgroundColor: "#fbbf24",
										type: "line",
										borderColor: "#fbbf24",
										fill: false,
										tension: 0.3,
									},
								],
							}}
							options={{
								...commonOptions,
								scales: {
									y: {
										beginAtZero: true,
										title: {
											display: true,
											text: "Time Spent (minutes)",
										},
									},
								}
							}}
						/>
					</div>
				</div>
			</div>

			{/* Time Spent per Question */}
			<div className="bg-white p-4 rounded flex justify-center flex-col items-center shadow-md">
				<h2 className="text-xl font-semibold mb-4">Time Spent per Question</h2>
				<div className="w-full overflow-x-auto"> {/* Added scrolling */}
					{/* Line chart for Time Spent on Each Question */}
					<div style={{ minWidth: `${questionLabels.length * 60}px` }}> {/* Dynamically setting width */}
						<Line
							ref={el => {
								if (el?.chartInstance) {
									chartRef.current.push(el.chartInstance);
								}
							}}
							data={{
								labels: questionLabels, // Array of question numbers or identifiers
								datasets: [
									{
										label: "Time Spent (min)",
										data: timeSpentOnQuestionsData, // Array of time spent per question
										borderColor: "#3b82f6", // Line color
										backgroundColor: "rgba(59, 130, 246, 0.2)", // Area fill color (optional)
										pointBackgroundColor: "#3b82f6",
										tension: 0.3, // Smoothens the line
										fill: true, // Fill under the line
									},
								],
							}}
							options={{
								maintainAspectRatio: false, // Ensures the chart adjusts to container
								plugins: {
									tooltip: {
										callbacks: {
											label: function (context) {
												return `${context.raw} mins`;
											},
										},
									},
								},
								scales: {
									x: {
										title: {
											display: true,
											text: "Question",
										},
										ticks: {
											autoSkip: true,
											maxTicksLimit: 20, // Reduces label density
										},
									},
									y: {
										beginAtZero: true,
										title: {
											display: true,
											text: "Time Spent (minutes)",
										},
									},
								},
							}}
							height={200} // Adjust the height of the chart
						/>
					</div>
				</div>
			</div>

			<div className="bg-white p-4 rounded shadow-md flex flex-col justify-center items-center  lg:flex-row">
				<div className="w-full lg:w-1/2 flex justify-center items-center flex-col">
					<h2 className="text-xl font-semibold mb-4">Difficulty-Wise Performance</h2>
					<div className="w-full h-64 flex justify-center">
						{/* Grouped Bar Chart for Difficulty-Wise Performance */}
						<Bar
							ref={(el) => {
								if (el?.chartInstance) {
									chartRef.current.push(el.chartInstance);
								}
							}}
							data={{
								labels: difficultyLabels, // Labels for difficulty levels: ["Easy", "Medium", "Hard"]
								datasets: [
									{
										label: "Correct",
										data: correctData, // Data for "Correct" responses
										backgroundColor: "#34d399", // Green color for correct
									},
									{
										label: "Incorrect",
										data: incorrectData, // Data for "Incorrect" responses
										backgroundColor: "#f87171", // Red color for incorrect
									},
									{
										label: "Not Attempted",
										data: notAttemptedData, // Data for "Not Attempted" responses
										backgroundColor: "#a78bfa", // Purple color for not attempted
									},
								],
							}}
							options={{
								plugins: {
									legend: {
										position: "top", // Legend position
									},
									title: {
										display: false,
										text: "Difficulty-Wise Performance", // Chart title
									},
								},
								scales: {
									x: {
										title: {
											display: true,
											text: "Difficulty Levels", // X-axis title
										},
										stacked: false, // Ensures it's a grouped bar chart
									},
									y: {
										title: {
											display: true,
											text: "Questions", // Y-axis title
										},
										beginAtZero: true,
										stacked: false, // Ensures it's a grouped bar chart
									},
								},
							}}
							height={100} // Adjusting the height of the chart
							width={100} // Adjusting the width of the chart
						/>
					</div>

				</div>
				<div className="w-full lg:w-1/2 flex justify-center items-center flex-col">
					<h2 className="text-xl font-semibold mb-4">Accuracy Distribution</h2>
					<div className="w-full h-64 flex justify-center">
						{/* Doughnut chart for Subject Accuracy */}
						<Pie
							ref={el => {
								if (el?.chartInstance) {
									chartRef.current.push(el.chartInstance);
								}
							}}
							data={{
								labels: subjectLabels,
								datasets: [
									{
										label: "Accuracy (%)",
										data: accuracyData,
										backgroundColor: ["#34d399", "#a78bfa", "#fbbf24"],
									},
								],
							}}
							options={commonOptions}
							height={100}  // Adjusting the height to reduce chart size
							width={100}   // Adjusting the width to reduce chart size
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Chart;
