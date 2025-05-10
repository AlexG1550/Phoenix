const Filters = ({
         data, masterFilter, setMasterFilter, columnOrder, setColumnOrder,
         draggingIndex, handleDragStart, handleDragOver, handleDrop,
         selectedCycles, setSelectedCycles, itemFilter, setItemFilter
     }) => {
         const handleMasterFilterChange = (label) => {
             setMasterFilter(prev => ({
                 ...prev,
                 [label]: !prev[label]
             }));
         };

         const cycles = [...new Set(Object.keys(data.Supervisor).concat(Object.keys(data.Market), Object.keys(data.ROM), Object.keys(data.National)))].sort();

         return (
             <div className="mb-6">
                 <h2 className="text-xl font-semibold text-gray-800 mb-2">Filters and Column Order</h2>
                 <div className="mb-4">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Item Filter</label>
                     <input
                         type="text"
                         value={itemFilter}
                         onChange={(e) => setItemFilter(e.target.value)}
                         placeholder="Filter by item name..."
                         className="p-2 border border-gray-300 rounded-md w-full"
                     />
                 </div>
                 <div className="mb-4">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Select Cycles</label>
                     <select
                         multiple
                         value={selectedCycles}
                         onChange={(e) => setSelectedCycles([...e.target.selectedOptions].map(o => o.value))}
                         className="p-2 border border-gray-300 rounded-md w-full"
                     >
                         {cycles.map(cycle => (
                             <option key={cycle} value={cycle}>{cycle}</option>
                         ))}
                     </select>
                 </div>
                 <div className="border border-gray-300 rounded-lg bg-white shadow-sm">
                     {columnOrder.map((label, index) => (
                         <div
                             key={label}
                             draggable
                             onDragStart={() => handleDragStart(index)}
                             onDragOver={(e) => handleDragOver(e, index)}
                             onDrop={() => handleDrop(index)}
                             className={`flex items-center p-2 text-sm text-gray-700 hover:bg-gray-50 cursor-move ${draggingIndex === index ? 'bg-gray-100' : ''}`}
                         >
                             <svg className="h-4 w-4 text-gray-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
                             </svg>
                             <input
                                 type="checkbox"
                                 checked={masterFilter[label] !== false}
                                 onChange={() => handleMasterFilterChange(label)}
                                 className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                             />
                             <span className="ml-2">{label}</span>
                         </div>
                     ))}
                 </div>
             </div>
         );
     };