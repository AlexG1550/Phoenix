const ABC = ({ data }) => {
    const performABCAnalysis = () => {
        const items = {};
        Object.values(data.National).forEach(cycleData => {
            Object.entries(cycleData.National || {}).forEach(([item, metrics]) => {
                if (!items[item]) items[item] = 0;
                items[item] += metrics.Arrival;
            });
        });

        const sortedItems = Object.entries(items)
            .sort((a, b) => b[1] - a[1])
            .map(([item, value], index, arr) => {
                const cumulative = arr.slice(0, index + 1).reduce((sum, [, v]) => sum + v, 0);
                const total = arr.reduce((sum, [, v]) => sum + v, 0);
                const cumulativePercent = (cumulative / total) * 100;
                let category;
                if (cumulativePercent <= 80) category = 'A';
                else if (cumulativePercent <= 95) category = 'B';
                else category = 'C';
                return { item, value, category };
            });

        return sortedItems;
    };

    const abcData = performABCAnalysis();

    return (
        <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">ABC Analysis</h2>
            <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                    <tr>
                        <th className="border border-gray-300 p-2 bg-gray-200 font-bold">Item</th>
                        <th className="border border-gray-300 p-2 bg-gray-200 font-bold">Total TDP% Arrival</th>
                        <th className="border border-gray-300 p-2 bg-gray-200 font-bold">Category</th>
                    </tr>
                </thead>
                <tbody>
                    {abcData.map((row, index) => (
                        <tr key={index} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                            <td className="border border-gray-300 p-2">{row.item}</td>
                            <td className="border border-gray-300 p-2 text-right">{row.value.toFixed(2)}%</td>
                            <td className="border border-gray-300 p-2">{row.category}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};