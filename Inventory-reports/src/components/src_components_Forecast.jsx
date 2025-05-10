const Forecast = ({ data }) => {
    const forecast = () => {
        const cycles = Object.keys(data.National).sort();
        const x = cycles.map((_, i) => i);
        const y = cycles.map(cycle => {
            const metrics = Object.values(data.National[cycle]?.National || {}).map(m => m.Arrival);
            return metrics.reduce((sum, v) => sum + (v || 0), 0) / metrics.length || 0;
        });

        const n = x.length;
        if (n < 2) return null;

        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        const nextCycle = n;
        const predicted = slope * nextCycle + intercept;

        return { cycle: `C${parseInt(cycles[cycles.length - 1].replace('C', '')) + 1}`, predicted };
    };

    const result = forecast();

    return (
        <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">TDP% Forecast</h2>
            {result ? (
                <p className="text-gray-600">Predicted Arrival TDP% for {result.cycle}: {result.predicted.toFixed(2)}%</p>
            ) : (
                <p className="text-gray-600">Insufficient data for forecasting.</p>
            )}
        </div>
    );
};