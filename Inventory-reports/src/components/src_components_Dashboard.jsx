const Dashboard = ({ data, getEntities, getItems, getCycles }) => {
    const categories = ['Supervisor', 'Market', 'ROM', 'National'];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Inventory Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(category => {
                    const cycles = getCycles(category);
                    const entities = getEntities(category);
                    const items = getItems(category);
                    const avgArrival = cycles.reduce((sum, cycle) => {
                        const metrics = data[category][cycle];
                        if (!metrics) return sum;
                        const values = Object.values(metrics).flatMap(m => m.metrics ? Object.values(m.metrics).map(v => v.Arrival) : Object.values(m).map(v => v.Arrival));
                        return sum + values.reduce((s, v) => s + (v || 0), 0) / values.length;
                    }, 0) / cycles.length || 0;

                    return (
                        <div key={category} className="bg-white p-4 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold">{category}</h2>
                            <p className="text-gray-600">Entities: {entities.length}</p>
                            <p className="text-gray-600">Items: {items.length}</p>
                            <p className="text-gray-600">Avg Arrival TDP%: {avgArrival.toFixed(2)}%</p>
                            <Charts data={data[category]} cycles={cycles} category={category} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};