function getAllUniqueLabels(data, getCycles) {
    const orderedLabels = [
        { label: 'Supervisor', key: 'Market_supervisor' },
        { label: 'Entity', key: '{category}_entity' },
        { label: 'Item', key: '{category}_item' },
        { label: 'C6 Arrival (%)', key: '{category}_C6_Arrival' },
        { label: 'C7 Arrival (%)', key: '{category}_C7_Arrival' },
        { label: 'Change C6-C7 Arrival (%)', key: '{category}_Change_C6_C7_Arrival' },
        { label: 'C8 Arrival (%)', key: '{category}_C8_Arrival' },
        { label: 'Change C7-C8 Arrival (%)', key: '{category}_Change_C7_C8_Arrival' },
        { label: 'C9 Arrival (%)', key: '{category}_C9_Arrival' },
        { label: 'Change C8-C9 Arrival (%)', key: '{category}_Change_C8_C9_Arrival' },
        { label: 'C6 Exit (%)', key: '{category}_C6_Exit' },
        { label: 'C7 Exit (%)', key: '{category}_C7_Exit' },
        { label: 'Change C6-C7 Exit (%)', key: '{category}_Change_C6_C7_Exit' },
        { label: 'C8 Exit (%)', key: '{category}_C8_Exit' },
        { label: 'Change C7-C8 Exit (%)', key: '{category}_Change_C7_C8_Exit' },
        { label: 'C9 Exit (%)', key: '{category}_C9_Exit' },
        { label: 'Change C8-C9 Exit (%)', key: '{category}_Change_C8_C9_Exit' }
    ];
    const categories = ['Supervisor', 'Market', 'ROM'];
    categories.forEach(category => {
        const mostRecentCycle = getCycles(data, category).slice(-1)[0];
        if (mostRecentCycle) {
            orderedLabels.push(
                { label: `${mostRecentCycle} Arrival vs National (%)`, key: `${category}_${mostRecentCycle}_Arrival_vs_National` },
                { label: `${mostRecentCycle} Exit vs National (%)`, key: `${category}_${mostRecentCycle}_Exit_vs_National` }
            );
        }
    });
    return orderedLabels;
}

function filterHeaders(headers, type) {
    return headers.filter(h => h.endsWith(`_${type}`) || (h.includes('_Change_') && h.endsWith(`_${type}`)) || h.endsWith(`_${type}_vs_National`));
}

function filterData(data, headers) {
    return data.map(row => {
        const filteredRow = {};
        headers.forEach(header => {
            filteredRow[header] = row[header];
        });
        return filteredRow;
    });
}

function dataToAoaWithStyles(data, headers) {
    const aoa = [headers.map(header => ({
        v: getLabelFromKey(header),
        s: { font: { bold: true }, fill: { fgColor: { rgb: "E2E8F0" } } }
    }))];
    data.forEach(row => {
        const rowData = headers.map(header => {
            let value = row[header];
            let style = {};
            let cellType = 's';
            if (header.includes('_Arrival') || header.includes('_Exit') || header.includes('_Change') || header.endsWith('_vs_National')) {
                style = { numFmt: "0.00%" };
                if (typeof value === 'number') {
                    value = value / 100;
                    cellType = 'n';
                } else {
                    value = 'N/A';
                    cellType = 's';
                }
                if ((header.includes('_Change') || header.endsWith('_vs_National')) && typeof value === 'number') {
                    style.fill = { fgColor: { rgb: header.includes('_Change') ? "FEF9C3" : "E6F7FF" } };
                    if (value > 0) style.font = { color: { rgb: "166534" } };
                    else if (value < 0) style.font = { color: { rgb: "DC2626" } };
                }
            }
            return { v: value, t: cellType, s: style };
        });
        aoa.push(rowData);
    });
    return aoa;
}

function getLabelFromKey(key) {
    if (key.endsWith('_item')) return 'Item';
    if (key.endsWith('_entity')) return 'Entity';
    if (key.endsWith('_supervisor')) return 'Supervisor';
    const parts = key.split('_');
    if (parts.length >= 3) {
        if (parts[1] === 'Change') {
            if (parts.length === 5) {
                const cycle1 = parts[2];
                const cycle2 = parts[3];
                const type = parts[4];
                return `Change ${cycle1}-${cycle2} ${type} (%)`;
            }
        } else {
            if (parts.length === 3) {
                const cycle = parts[1];
                const type = parts[2];
                return `${cycle} ${type} (%)`;
            }
        }
    }
    const cyclePart = parts.find(p => p.startsWith('C'));
    if (cyclePart) {
        if (parts.slice(-3).join('_') === 'Arrival_vs_National') {
            return `${cyclePart} Arrival vs National (%)`;
        }
        if (parts.slice(-3).join('_') === 'Exit_vs_National') {
            return `${cyclePart} Exit vs National (%)`;
        }
    }
    return key;
}

function getSupervisorHeaders(data, masterFilter, columnOrder, getCycles) {
    const cycles = getCycles(data, 'Supervisor').filter(c => ['C6', 'C7', 'C8', 'C9'].includes(c));
    const allHeaders = ['Supervisor_entity', 'Supervisor_item'];
    cycles.forEach((cycle, index) => {
        allHeaders.push(`Supervisor_${cycle}_Arrival`, `Supervisor_${cycle}_Exit`);
        if (index < cycles.length - 1) {
            allHeaders.push(`Supervisor_Change_${cycle}_${cycles[index + 1]}_Arrival`, `Supervisor_Change_${cycle}_${cycles[index + 1]}_Exit`);
        }
    });
    if (cycles.length > 0) {
        const mostRecentCycle = cycles[cycles.length - 1];
        allHeaders.push(`Supervisor_${mostRecentCycle}_Arrival_vs_National`, `Supervisor_${mostRecentCycle}_Exit_vs_National`);
    }
    return allHeaders
        .filter(key => masterFilter[getLabelFromKey(key)] !== false)
        .sort((a, b) => columnOrder.indexOf(getLabelFromKey(a)) - columnOrder.indexOf(getLabelFromKey(b)));
}

function getSupervisorDataForExport(data, getCycles, getEntities, getItems) {
    const cycles = getCycles(data, 'Supervisor').filter(c => ['C6', 'C7', 'C8', 'C9'].includes(c));
    const entities = getEntities(data, 'Supervisor');
    const allData = [];
    entities.forEach(entity => {
        const items = getItems(data, 'Supervisor', entity);
        items.forEach(item => {
            const row = { 'Supervisor_entity': entity, 'Supervisor_item': item };
            cycles.forEach((cycle, index) => {
                const metrics = data.Supervisor[cycle]?.[entity];
                row[`Supervisor_${cycle}_Arrival`] = metrics?.[item]?.Arrival;
                row[`Supervisor_${cycle}_Exit`] = metrics?.[item]?.Exit;
                if (index < cycles.length - 1) {
                    const nextCycle = cycles[index + 1];
                    const fromArrival = row[`Supervisor_${cycle}_Arrival`];
                    const toArrival = data.Supervisor[nextCycle]?.[entity]?.[item]?.Arrival;
                    const fromExit = row[`Supervisor_${cycle}_Exit`];
                    const toExit = data.Supervisor[nextCycle]?.[entity]?.[item]?.Exit;
                    row[`Supervisor_Change_${cycle}_${nextCycle}_Arrival`] = (typeof toArrival === 'number' && typeof fromArrival === 'number') ? toArrival - fromArrival : null;
                    row[`Supervisor_Change_${cycle}_${nextCycle}_Exit`] = (typeof toExit === 'number' && typeof fromExit === 'number') ? toExit - fromExit : null;
                }
            });
            if (cycles.length > 0) {
                const mostRecentCycle = cycles[cycles.length - 1];
                if (data.National[mostRecentCycle]) {
                    const nationalMetrics = data.National[mostRecentCycle]['National'];
                    if (nationalMetrics && nationalMetrics[item]) {
                        const entityArrival = row[`Supervisor_${mostRecentCycle}_Arrival`];
                        const nationalArrival = nationalMetrics[item].Arrival;
                        if (typeof entityArrival === 'number' && typeof nationalArrival === 'number') {
                            row[`Supervisor_${mostRecentCycle}_Arrival_vs_National`] = entityArrival - nationalArrival;
                        }
                        const entityExit = row[`Supervisor_${mostRecentCycle}_Exit`];
                        const nationalExit = nationalMetrics[item].Exit;
                        if (typeof entityExit === 'number' && typeof nationalExit === 'number') {
                            row[`Supervisor_${mostRecentCycle}_Exit_vs_National`] = entityExit - nationalExit;
                        }
                    }
                }
            }
            allData.push(row);
        });
    });
    return allData;
}

function getRomHeaders(data, masterFilter, columnOrder, getCycles) {
    const cycles = getCycles(data, 'ROM').filter(c => ['C6', 'C7', 'C8', 'C9'].includes(c));
    const allHeaders = ['ROM_entity', 'ROM_item'];
    cycles.forEach((cycle, index) => {
        allHeaders.push(`ROM_${cycle}_Arrival`, `ROM_${cycle}_Exit`);
        if (index < cycles.length - 1) {
            allHeaders.push(`ROM_Change_${cycle}_${cycles[index + 1]}_Arrival`, `ROM_Change_${cycle}_${cycles[index + 1]}_Exit`);
        }
    });
    if (cycles.length > 0) {
        const mostRecentCycle = cycles[cycles.length - 1];
        allHeaders.push(`ROM_${mostRecentCycle}_Arrival_vs_National`, `ROM_${mostRecentCycle}_Exit_vs_National`);
    }
    return allHeaders
        .filter(key => masterFilter[getLabelFromKey(key)] !== false)
        .sort((a, b) => columnOrder.indexOf(getLabelFromKey(a)) - columnOrder.indexOf(getLabelFromKey(b)));
}

function getRomDataForExport(data, getCycles, getEntities, getItems) {
    const cycles = getCycles(data, 'ROM').filter(c => ['C6', 'C7', 'C8', 'C9'].includes(c));
    const entities = getEntities(data, 'ROM');
    const allData = [];
    entities.forEach(entity => {
        const items = getItems(data, 'ROM', entity);
        items.forEach(item => {
            const row = { 'ROM_entity': entity, 'ROM_item': item };
            cycles.forEach((cycle, index) => {
                const metrics = data.ROM[cycle]?.[entity];
                row[`ROM_${cycle}_Arrival`] = metrics?.[item]?.Arrival;
                row[`ROM_${cycle}_Exit`] = metrics?.[item]?.Exit;
                if (index < cycles.length - 1) {
                    const nextCycle = cycles[index + 1];
                    const fromArrival = row[`ROM_${cycle}_Arrival`];
                    const toArrival = data.ROM[nextCycle]?.[entity]?.[item]?.Arrival;
                    const fromExit = row[`ROM_${cycle}_Exit`];
                    const toExit = data.ROM[nextCycle]?.[entity]?.[item]?.Exit;
                    row[`ROM_Change_${cycle}_${nextCycle}_Arrival`] = (typeof toArrival === 'number' && typeof fromArrival === 'number') ? toArrival - fromArrival : null;
                    row[`ROM_Change_${cycle}_${nextCycle}_Exit`] = (typeof toExit === 'number' && typeof fromExit === 'number') ? toExit - fromExit : null;
                }
            });
            if (cycles.length > 0) {
                const mostRecentCycle = cycles[cycles.length - 1];
                if (data.National[mostRecentCycle]) {
                    const nationalMetrics = data.National[mostRecentCycle]['National'];
                    if (nationalMetrics && nationalMetrics[item]) {
                        const entityArrival = row[`ROM_${mostRecentCycle}_Arrival`];
                        const nationalArrival = nationalMetrics[item].Arrival;
                        if (typeof entityArrival === 'number' && typeof nationalArrival === 'number') {
                            row[`ROM_${mostRecentCycle}_Arrival_vs_National`] = entityArrival - nationalArrival;
                        }
                        const entityExit = row[`ROM_${mostRecentCycle}_Exit`];
                        const nationalExit = nationalMetrics[item].Exit;
                        if (typeof entityExit === 'number' && typeof nationalExit === 'number') {
                            row[`ROM_${mostRecentCycle}_Exit_vs_National`] = entityExit - nationalExit;
                        }
                    }
                }
            }
            allData.push(row);
        });
    });
    return allData;
}

function getNationalHeaders(data, masterFilter, columnOrder, getCycles) {
    const cycles = getCycles(data, 'National').filter(c => ['C6', 'C7', 'C8', 'C9'].includes(c));
    const allHeaders = ['National_item'];
    cycles.forEach((cycle, index) => {
        allHeaders.push(`National_${cycle}_Arrival`, `National_${cycle}_Exit`);
        if (index < cycles.length - 1) {
            allHeaders.push(`National_Change_${cycle}_${cycles[index + 1]}_Arrival`, `National_Change_${cycle}_${cycles[index + 1]}_Exit`);
        }
    });
    return allHeaders
        .filter(key => masterFilter[getLabelFromKey(key)] !== false)
        .sort((a, b) => columnOrder.indexOf(getLabelFromKey(a)) - columnOrder.indexOf(getLabelFromKey(b)));
}

function getNationalDataForExport(data, getCycles, getItems) {
    const cycles = getCycles(data, 'National').filter(c => ['C6', 'C7', 'C8', 'C9'].includes(c));
    const items = getItems(data, 'National');
    const allData = [];
    items.forEach(item => {
        const row = { 'National_item': item };
        cycles.forEach((cycle, index) => {
            const metrics = data.National[cycle]?.['National'];
            row[`National_${cycle}_Arrival`] = metrics?.[item]?.Arrival;
            row[`National_${cycle}_Exit`] = metrics?.[item]?.Exit;
            if (index < cycles.length - 1) {
                const nextCycle = cycles[index + 1];
                const fromArrival = row[`National_${cycle}_Arrival`];
                const toArrival = data.National[nextCycle]?.['National']?.[item]?.Arrival;
                const fromExit = row[`National_${cycle}_Exit`];
                const toExit = data.National[nextCycle]?.['National']?.[item]?.Exit;
                row[`National_Change_${cycle}_${nextCycle}_Arrival`] = (typeof toArrival === 'number' && typeof fromArrival === 'number') ? toArrival - fromArrival : null;
                row[`National_Change_${cycle}_${nextCycle}_Exit`] = (typeof toExit === 'number' && typeof fromExit === 'number') ? toExit - fromExit : null;
            }
        });
        allData.push(row);
    });
    return allData;
}

function getMarketHeaders(data, masterFilter, columnOrder, getCycles) {
    const cycles = getCycles(data, 'Market').filter(c => ['C6', 'C7', 'C8', 'C9'].includes(c));
    const allHeaders = ['Market_supervisor', 'Market_entity', 'Market_item'];
    cycles.forEach((cycle, index) => {
        allHeaders.push(`Market_${cycle}_Arrival`, `Market_${cycle}_Exit`);
        if (index < cycles.length - 1) {
            allHeaders.push(`Market_Change_${cycle}_${cycles[index + 1]}_Arrival`, `Market_Change_${cycle}_${cycles[index + 1]}_Exit`);
        }
    });
    if (cycles.length > 0) {
        const mostRecentCycle = cycles[cycles.length - 1];
        allHeaders.push(`Market_${mostRecentCycle}_Arrival_vs_National`, `Market_${mostRecentCycle}_Exit_vs_National`);
    }
    return allHeaders
        .filter(key => masterFilter[getLabelFromKey(key)] !== false)
        .sort((a, b) => columnOrder.indexOf(getLabelFromKey(a)) - columnOrder.indexOf(getLabelFromKey(b)));
}

function getMarketDataForExport(data, getCycles, getEntities, getItems) {
    const cycles = getCycles(data, 'Market').filter(c => ['C6', 'C7', 'C8', 'C9'].includes(c));
    const entities = getEntities(data, 'Market');
    const allData = [];
    entities.forEach(entity => {
        const items = getItems(data, 'Market', entity);
        const supervisor = data.Market[cycles[0]]?.[entity]?.supervisor || 'N/A';
        items.forEach(item => {
            const row = { 'Market_supervisor': supervisor, 'Market_entity': entity, 'Market_item': item };
            cycles.forEach((cycle, index) => {
                const metrics = data.Market[cycle]?.[entity]?.metrics;
                row[`Market_${cycle}_Arrival`] = metrics?.[item]?.Arrival;
                row[`Market_${cycle}_Exit`] = metrics?.[item]?.Exit;
                if (index < cycles.length - 1) {
                    const nextCycle = cycles[index + 1];
                    const fromArrival = row[`Market_${cycle}_Arrival`];
                    const toArrival = data.Market[nextCycle]?.[entity]?.metrics?.[item]?.Arrival;
                    const fromExit = row[`Market_${cycle}_Exit`];
                    const toExit = data.Market[nextCycle]?.[entity]?.metrics?.[item]?.Exit;
                    row[`Market_Change_${cycle}_${nextCycle}_Arrival`] = (typeof toArrival === 'number' && typeof fromArrival === 'number') ? toArrival - fromArrival : null;
                    row[`Market_Change_${cycle}_${nextCycle}_Exit`] = (typeof toExit === 'number' && typeof fromExit === 'number') ? toExit - fromExit : null;
                }
            });
            if (cycles.length > 0) {
                const mostRecentCycle = cycles[cycles.length - 1];
                if (data.National[mostRecentCycle]) {
                    const nationalMetrics = data.National[mostRecentCycle]['National'];
                    if (nationalMetrics && nationalMetrics[item]) {
                        const entityArrival = row[`Market_${mostRecentCycle}_Arrival`];
                        const nationalArrival = nationalMetrics[item].Arrival;
                        if (typeof entityArrival === 'number' && typeof nationalArrival === 'number') {
                            row[`Market_${mostRecentCycle}_Arrival_vs_National`] = entityArrival - nationalArrival;
                        }
                        const entityExit = row[`Market_${mostRecentCycle}_Exit`];
                        const nationalExit = nationalMetrics[item].Exit;
                        if (typeof entityExit === 'number' && typeof nationalExit === 'number') {
                            row[`Market_${mostRecentCycle}_Exit_vs_National`] = entityExit - nationalExit;
                        }
                    }
                }
            }
            allData.push(row);
        });
    });
    return allData;
}

function getMarketsForSupervisor(data, supervisor) {
    const markets = new Set();
    Object.values(data.Market).forEach(cycleData => {
        Object.entries(cycleData).forEach(([market, data]) => {
            if (data.supervisor === supervisor) markets.add(market);
        });
    });
    return [...markets].sort();
}