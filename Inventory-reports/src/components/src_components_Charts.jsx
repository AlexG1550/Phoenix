const Charts = ({ data, cycles, category }) => {
    const canvasRef = React.useRef(null);
    const chartInstanceRef = React.useRef(null);

    React.useEffect(() => {
        if (!canvasRef.current || !cycles.length) return;

        const ctx = canvasRef.current.getContext('2d');
        const datasets = cycles.map((cycle, index) => {
            const metrics = Object.values(data[cycle] || {}).flatMap(m => m.metrics ? Object.values(m.metrics).map(v => v.Arrival) : Object.values(m).map(v => v.Arrival));
            const avg = metrics.reduce((sum, v) => sum + (v || 0), 0) / metrics.length || 0;
            return {
                label: `${cycle} Arrival`,
                data: [avg],
                backgroundColor: index % 2 === 0 ? 'rgba(54, 162, 235, 0.5)' : 'rgba(75, 192, 192, 0.5)',
            };
        });

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        chartInstanceRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Average Arrival TDP%'],
                datasets
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: { display: true, text: 'TDP% Arrival' }
                    }
                }
            }
        });

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [data, cycles]);

    return <canvas ref={canvasRef} className="mt-4" />;
};