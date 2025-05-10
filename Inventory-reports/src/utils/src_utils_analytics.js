function getEntities(data, category) {
    return [...new Set(Object.values(data[category]).flatMap(cycleData => Object.keys(cycleData)))].sort();
}

function getItems(data, category, entity = null) {
    const items = new Set();
    Object.values(data[category]).forEach(cycleData => {
        if (entity) {
            const entityData = cycleData[entity];
            if (entityData) {
                const metrics = category === 'Market' ? entityData.metrics : entityData;
                Object.keys(metrics || {}).forEach(item => items.add(item));
            }
        } else {
            Object.values(cycleData).forEach(entityData => {
                const metrics = category === 'Market' ? entityData.metrics : entityData;
                Object.keys(metrics || {}).forEach(item => items.add(item));
            });
        }
    });
    return [...items].sort();
}

function getCycles(data, category) {
    return Object.keys(data[category]).sort((a, b) => parseInt(a.replace('C', '')) - parseInt(b.replace('C', '')));
}