const { FixedSizeList } = ReactWindow;

     const Table = ({ category, entity, data, sortConfig, handleSort, masterFilter, columnOrder, selectedCycles, itemFilter }) => {
         const getEntities = (cat) => [...new Set(Object.values(data[cat]).flatMap(cycleData => Object.keys(cycleData)))].sort();
         const getItems = (cat, ent = null) => {
             const items = new Set();
             Object.values(data[cat]).forEach(cycleData => {
                 if (ent) {
                     const entityData = cycleData[ent];
                     if (entityData) {
                         const metrics = cat === 'Market' ? entityData.metrics : entityData;
                         Object.keys(metrics || {}).forEach(item => items.add(item));
                     }
                 } else {
                     Object.values(cycleData).forEach(entityData => {
                         const metrics = cat === 'Market' ? entityData.metrics : entityData;
                         Object.keys(metrics || {}).forEach(item => items.add(item));
                     });
                 }
             });
             return [...items].sort();
         };

         const cycles = selectedCycles.length > 0 ? selectedCycles : ['C6', 'C7', 'C8', 'C9'].filter(c => Object.keys(data[category]).includes(c));
         if (cycles.length < 2 && selectedCycles.length === 0) return <p className="text-gray-600">At least two cycles are required for comparison.</p>;

         const items = getItems(category, entity);
         const sortKey = `${category}-${entity}`;
         const currentSortConfig = sortConfig[sortKey] || { column: null, order: 'asc' };

         let tableData = items
             .filter(item => !itemFilter || item.toLowerCase().includes(itemFilter.toLowerCase()))
             .map(item => {
                 const row = { [`${category}_item`]: item, [`${category}_entity`]: entity };
                 if (category === 'Market') {
                     row[`${category}_supervisor`] = data.Market[cycles[0]]?.[entity]?.supervisor || 'N/A';
                 }
                 cycles.forEach((cycle, index) => {
                     let metrics;
                     if (category === 'Market') {
                         metrics = data.Market[cycle]?.[entity]?.metrics;
                     } else if (category === 'ROM') {
                         metrics = data.ROM[cycle]?.[entity];
                     } else if (category === 'National') {
                         metrics = data.National[cycle]?.['National'];
                     } else {
                         metrics = data.Supervisor[cycle]?.[entity];
                     }
                     row[`${category}_${cycle}_Arrival`] = metrics?.[item]?.Arrival;
                     row[`${category}_${cycle}_Exit`] = metrics?.[item]?.Exit;
                     if (index < cycles.length - 1) {
                         const nextCycle = cycles[index + 1];
                         let nextMetrics;
                         if (category === 'Market') {
                             nextMetrics = data.Market[nextCycle]?.[entity]?.metrics;
                         } else if (category === 'ROM') {
                             nextMetrics = data.ROM[nextCycle]?.[entity];
                         } else if (category === 'National') {
                             nextMetrics = data.National[nextCycle]?.['National'];
                         } else {
                             nextMetrics = data.Supervisor[nextCycle]?.[entity];
                         }
                         const fromArrival = row[`${category}_${cycle}_Arrival`];
                         const toArrival = nextMetrics?.[item]?.Arrival;
                         const fromExit = row[`${category}_${cycle}_Exit`];
                         const toExit = nextMetrics?.[item]?.Exit;
                         row[`${category}_Change_${cycle}_${nextCycle}_Arrival`] = (typeof toArrival === 'number' && typeof fromArrival === 'number') ? toArrival - fromArrival : null;
                         row[`${category}_Change_${cycle}_${nextCycle}_Exit`] = (typeof toExit === 'number' && typeof fromExit === 'number') ? toExit - fromExit : null;
                     }
                 });
                 if (category !== 'National' && cycles.length > 0) {
                     const mostRecentCycle = cycles[cycles.length - 1];
                     if (data.National[mostRecentCycle]) {
                         const nationalMetrics = data.National[mostRecentCycle]['National'];
                         if (nationalMetrics && nationalMetrics[item]) {
                             const entityArrival = row[`${category}_${mostRecentCycle}_Arrival`];
                             const nationalArrival = nationalMetrics[item].Arrival;
                             if (typeof entityArrival === 'number' && typeof nationalArrival === 'number') {
                                 row[`${category}_${mostRecentCycle}_Arrival_vs_National`] = entityArrival - nationalArrival;
                             }
                             const entityExit = row[`${category}_${mostRecentCycle}_Exit`];
                             const nationalExit = nationalMetrics[item].Exit;
                             if (typeof entityExit === 'number' && typeof nationalExit === 'number') {
                                 row[`${category}_${mostRecentCycle}_Exit_vs_National`] = entityExit - nationalExit;
                             }
                         }
                     }
                 }
                 return row;
             });

         if (currentSortConfig.column) {
             tableData.sort((a, b) => {
                 const aValue = a[currentSortConfig.column] || 0;
                 const bValue = b[currentSortConfig.column] || 0;
                 return currentSortConfig.order === 'asc' ? aValue - bValue : bValue - aValue;
             });
         }

         const allHeaders = category === 'Market' ? [
             { label: 'Supervisor', key: `${category}_supervisor`, className: 'bg-gray-200 font-bold' },
             { label: 'Entity', key: `${category}_entity`, className: 'bg-gray-200 font-bold' },
             { label: 'Item', key: `${category}_item`, className: 'bg-gray-200 font-bold' },
             ...cycles.map((cycle, index) => [
                 { label: `${cycle} Arrival (%)`, key: `${category}_${cycle}_Arrival`, className: `${index % 2 === 0 ? 'bg-blue-100' : 'bg-green-100'} font-semibold` },
                 { label: `${cycle} Exit (%)`, key: `${category}_${cycle}_Exit`, className: `${index % 2 === 0 ? 'bg-blue-100' : 'bg-green-100'} font-semibold` },
                 ...(index < cycles.length - 1 ? [
                     { label: `Change ${cycle}-${cycles[index + 1]} Arrival (%)`, key: `${category}_Change_${cycle}_${cycles[index + 1]}_Arrival`, className: 'bg-yellow-100 font-semibold' },
                     { label: `Change ${cycle}-${cycles[index + 1]} Exit (%)`, key: `${category}_Change_${cycle}_${cycles[index + 1]}_Exit`, className: 'bg-yellow-100 font-semibold' }
                 ] : [])
             ]).flat()
         ] : category === 'National' ? [
             { label: 'Item', key: `${category}_item`, className: 'bg-gray-200 font-bold' },
             ...cycles.map((cycle, index) => [
                 { label: `${cycle} Arrival (%)`, key: `${category}_${cycle}_Arrival`, className: `${index % 2 === 0 ? 'bg-blue-100' : 'bg-green-100'} font-semibold` },
                 { label: `${cycle} Exit (%)`, key: `${category}_${cycle}_Exit`, className: `${index % 2 === 0 ? 'bg-blue-100' : 'bg-green-100'} font-semibold` },
                 ...(index < cycles.length - 1 ? [
                     { label: `Change ${cycle}-${cycles[index + 1]} Arrival (%)`, key: `${category}_Change_${cycle}_${cycles[index + 1]}_Arrival`, className: 'bg-yellow-100 font-semibold' },
                     { label: `Change ${cycle}-${cycles[index + 1]} Exit (%)`, key: `${category}_Change_${cycle}_${cycles[index + 1]}_Exit`, className: 'bg-yellow-100 font-semibold' }
                 ] : [])
             ]).flat()
         ] : [
             { label: 'Entity', key: `${category}_entity`, className: 'bg-gray-200 font-bold' },
             { label: 'Item', key: `${category}_item`, className: 'bg-gray-200 font-bold' },
             ...cycles.map((cycle, index) => [
                 { label: `${cycle} Arrival (%)`, key: `${category}_${cycle}_Arrival`, className: `${index % 2 === 0 ? 'bg-blue-100' : 'bg-green-100'} font-semibold` },
                 { label: `${cycle} Exit (%)`, key: `${category}_${cycle}_Exit`, className: `${index % 2 === 0 ? 'bg-blue-100' : 'bg-green-100'} font-semibold` },
                 ...(index < cycles.length - 1 ? [
                     { label: `Change ${cycle}-${cycles[index + 1]} Arrival (%)`, key: `${category}_Change_${cycle}_${cycles[index + 1]}_Arrival`, className: 'bg-yellow-100 font-semibold' },
                     { label: `Change ${cycle}-${cycles[index + 1]} Exit (%)`, key: `${category}_Change_${cycle}_${cycles[index + 1]}_Exit`, className: 'bg-yellow-100 font-semibold' }
                 ] : [])
             ]).flat()
         ];

         if (category !== 'National' && cycles.length > 0) {
             const mostRecentCycle = cycles[cycles.length - 1];
             allHeaders.push(
                 { label: `${mostRecentCycle} Arrival vs National (%)`, key: `${category}_${mostRecentCycle}_Arrival_vs_National`, className: 'bg-purple-100 font-semibold' },
                 { label: `${mostRecentCycle} Exit vs National (%)`, key: `${category}_${mostRecentCycle}_Exit_vs_National`, className: 'bg-purple-100 font-semibold' }
             );
         }

         const visibleHeaders = allHeaders.filter(header => masterFilter[header.label] !== false);
         const orderedVisibleHeaders = visibleHeaders.sort((a, b) => columnOrder.indexOf(a.label) - columnOrder.indexOf(b.label));

         const columnWidths = orderedVisibleHeaders.reduce((widths, header) => {
             let maxLength = header.label.length;
             tableData.forEach(row => {
                 const value = row[header.key];
                 const length = typeof value === 'number' ? `${value.toFixed(2)}%`.length : (value ? value.toString().length : 'N/A'.length);
                 maxLength = Math.max(maxLength, length);
             });
             widths[header.key] = Math.max(50, Math.min(maxLength * 6, 150));
             return widths;
         }, {});

         const Row = ({ index, style }) => {
             const row = tableData[index];
             return (
                 <div style={style} className={`flex h-6 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100`}>
                     {orderedVisibleHeaders.map(header => (
                         <div
                             key={header.key}
                             className={`border border-gray-300 p-2 flex items-center ${
                                 (header.key.includes('_Change_') || header.key.endsWith('_vs_National')) && row[header.key] !== null
                                     ? (row[header.key] > 5 ? 'text-green-600 font-medium' : row[header.key] < -5 ? 'text-red-600 font-medium' : '')
                                     : header.label.includes('Arrival') || header.label.includes('Exit') ? 'text-right' : 'text-left'
                             }`}
                             style={{
                                 width: `${columnWidths[header.key]}px`,
                                 minWidth: `${columnWidths[header.key]}px`,
                                 maxWidth: `${columnWidths[header.key]}px`
                             }}
                         >
                             {(header.key.includes('_Change_') || header.key.endsWith('_vs_National')) && row[header.key] !== null && row[header.key] > 5 && (
                                 <svg className="h-4 w-4 text-green-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                 </svg>
                             )}
                             {(header.key.includes('_Change_') || header.key.endsWith('_vs_National')) && row[header.key] !== null && row[header.key] < -5 && (
                                 <svg className="h-4 w-4 text-red-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                 </svg>
                             )}
                             {row[header.key] !== undefined
                                 ? (typeof row[header.key] === 'number' ? `${row[header.key].toFixed(2)}%` : row[header.key])
                                 : 'N/A'}
                         </div>
                     ))}
                 </div>
             );
         };

         return (
             <div className="overflow-x-auto">
                 <div className="sticky top-0 z-10 bg-white shadow-sm flex">
                     {orderedVisibleHeaders.map(header => (
                         <div
                             key={header.key}
                             className={`border border-gray-300 p-2 cursor-pointer ${header.className} text-left font-semibold flex items-center`}
                             style={{
                                 whiteSpace: 'normal',
                                 wordWrap: 'break-word',
                                 width: `${columnWidths[header.key]}px`,
                                 minWidth: `${columnWidths[header.key]}px`,
                                 maxWidth: `${columnWidths[header.key]}px`
                             }}
                             onClick={() => handleSort(category, entity, header.key)}
                         >
                             {header.label}
                             {sortConfig[sortKey]?.column === header.key && (
                                 sortConfig[sortKey].order === 'asc' ? (
                                     <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                     </svg>
                                 ) : (
                                     <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                     </svg>
                                 )
                             )}
                         </div>
                     ))}
                 </div>
                 <FixedSizeList
                     height={400}
                     itemCount={tableData.length}
                     itemSize={24}
                     width="100%"
                 >
                     {Row}
                 </FixedSizeList>
             </div>
         );
     };