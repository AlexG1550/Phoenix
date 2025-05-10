const Reports = ({
         data, setData, error, setError, expandedEntities, setExpandedEntities,
         sortConfig, setSortConfig, masterFilter, setMasterFilter, columnOrder,
         setColumnOrder, exportFormat, setExportFormat, isUploading, setIsUploading,
         draggingIndex, setDraggingIndex, selectedCycles, setSelectedCycles
     }) => {
         const [itemFilter, setItemFilter] = React.useState('');
         const toggleEntity = (category, entity) => {
             setExpandedEntities(prev => ({
                 ...prev,
                 [`${category}-${entity}`]: !prev[`${category}-${entity}`]
             }));
         };

         const handleSort = (category, entity, column) => {
             const key = `${category}-${entity}`;
             setSortConfig(prev => ({
                 ...prev,
                 [key]: {
                     column,
                     order: prev[key]?.column === column && prev[key].order === 'asc' ? 'desc' : 'asc'
                 }
             }));
         };

         const handleMasterFilterChange = (label) => {
             setMasterFilter(prev => ({
                 ...prev,
                 [label]: !prev[label]
             }));
         };

         const handleDragStart = (index) => {
             setDraggingIndex(index);
         };

         const handleDragOver = (e, index) => {
             e.preventDefault();
         };

         const handleDrop = (index) => {
             if (draggingIndex === null) return;
             const newOrder = [...columnOrder];
             const [draggedItem] = newOrder.splice(draggingIndex, 1);
             newOrder.splice(index, 0, draggedItem);
             setColumnOrder(newOrder);
             setDraggingIndex(null);
         };

         return (
             <div>
                 <h1 className="text-3xl font-bold text-gray-800 mb-4">Inventory Distribution Reports</h1>
                 <FileUpload
                     setData={setData}
                     setError={setError}
                     isUploading={isUploading}
                     setIsUploading={setIsUploading}
                 />
                 {error && <div className="bg-red-100 text-red-700 p-4 mb-6 rounded-lg">{error}</div>}
                 <Filters
                     data={data}
                     masterFilter={masterFilter}
                     setMasterFilter={setMasterFilter}
                     columnOrder={columnOrder}
                     setColumnOrder={setColumnOrder}
                     draggingIndex={draggingIndex}
                     handleDragStart={handleDragStart}
                     handleDragOver={handleDragOver}
                     handleDrop={handleDrop}
                     selectedCycles={selectedCycles}
                     setSelectedCycles={setSelectedCycles}
                     itemFilter={itemFilter}
                     setItemFilter={setItemFilter}
                 />
                 <Export
                     data={data}
                     exportFormat={exportFormat}
                     setExportFormat={setExportFormat}
                     columnOrder={columnOrder}
                     masterFilter={masterFilter}
                     setError={setError}
                 />
                 <ABC data={data} />
                 <Forecast data={data} />
                 <div className="space-y-8">
                     {['Supervisor', 'ROM', 'National'].map(category => (
                         <div key={category} className="bg-white p-6 rounded-lg shadow-md">
                             <h2 className="text-2xl font-semibold text-gray-800 mb-4">{category} Reports</h2>
                             {category === 'National' ? (
                                 <Table
                                     category="National"
                                     entity="National"
                                     data={data}
                                     sortConfig={sortConfig}
                                     handleSort={handleSort}
                                     masterFilter={masterFilter}
                                     columnOrder={columnOrder}
                                     selectedCycles={selectedCycles}
                                     itemFilter={itemFilter}
                                 />
                             ) : (
                                 getEntities(category).map(entity => (
                                     <div key={entity} className="mb-4">
                                         <button
                                             onClick={() => toggleEntity(category, entity)}
                                             className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium"
                                         >
                                             {expandedEntities[`${category}-${entity}`] ? '▼' : '▶'} {entity}
                                         </button>
                                         {expandedEntities[`${category}-${entity}`] && (
                                             <div className="mt-2 pl-4">
                                                 <Table
                                                     category={category}
                                                     entity={entity}
                                                     data={data}
                                                     sortConfig={sortConfig}
                                                     handleSort={handleSort}
                                                     masterFilter={masterFilter}
                                                     columnOrder={columnOrder}
                                                     selectedCycles={selectedCycles}
                                                     itemFilter={itemFilter}
                                                 />
                                             </div>
                                         )}
                                     </div>
                                 ))
                             )}
                         </div>
                     ))}
                 </div>
             </div>
         );
     };