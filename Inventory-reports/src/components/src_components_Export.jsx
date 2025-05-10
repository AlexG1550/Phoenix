const Export = ({ data, exportFormat, setExportFormat, columnOrder, masterFilter, setError }) => {
         const exportAllReports = () => {
             try {
                 if (exportFormat === 'pdf') {
                     const { jsPDF } = window.jspdf;
                     const doc = new jsPDF();
                     const reportTypes = [
                         { name: 'Supervisor', headersFn: () => getSupervisorHeaders(data, masterFilter, columnOrder, getCycles), dataFn: () => getSupervisorDataForExport(data, getCycles, getEntities, getItems) },
                         { name: 'Market', headersFn: () => getMarketHeaders(data, masterFilter, columnOrder, getCycles), dataFn: () => getMarketDataForExport(data, getCycles, getEntities, getItems) },
                         { name: 'ROM', headersFn: () => getRomHeaders(data, masterFilter, columnOrder, getCycles), dataFn: () => getRomDataForExport(data, getCycles, getEntities, getItems) },
                         { name: 'National', headersFn: () => getNationalHeaders(data, masterFilter, columnOrder, getCycles), dataFn: () => getNationalDataForExport(data, getCycles, getItems) }
                     ];

                     reportTypes.forEach((report, index) => {
                         const headers = report.headersFn();
                         const tableData = report.dataFn();
                         if (tableData.length < 1) return;

                         if (index > 0) doc.addPage();
                         doc.text(`${report.name} Report`, 14, 20);
                         doc.autoTable({
                             startY: 30,
                             head: [headers.map(h => getLabelFromKey(h))],
                             body: tableData.map(row => headers.map(h => {
                                 const value = row[h];
                                 return typeof value === 'number' ? `${value.toFixed(2)}%` : value || 'N/A';
                             })),
                             theme: 'striped',
                             headStyles: { fillColor: [100, 100, 100] },
                             margin: { top: 30 }
                         });
                     });

                     doc.save('inventory_reports.pdf');
                 } else {
                     const reportTypes = [
                         { name: 'Supervisor', cycles: getCycles(data, 'Supervisor'), headersFn: () => getSupervisorHeaders(data, masterFilter, columnOrder, getCycles), dataFn: () => getSupervisorDataForExport(data, getCycles, getEntities, getItems) },
                         { name: 'Market', cycles: getCycles(data, 'Market'), headersFn: () => getMarketHeaders(data, masterFilter, columnOrder, getCycles), dataFn: () => getMarketDataForExport(data, getCycles, getEntities, getItems) },
                         { name: 'ROM', cycles: getCycles(data, 'ROM'), headersFn: () => getRomHeaders(data, masterFilter, columnOrder, getCycles), dataFn: () => getRomDataForExport(data, getCycles, getEntities, getItems) },
                         { name: 'National', cycles: getCycles(data, 'National'), headersFn: () => getNationalHeaders(data, masterFilter, columnOrder, getCycles), dataFn: () => getNationalDataForExport(data, getCycles, getItems) }
                     ];

                     reportTypes.forEach(report => {
                         if (report.cycles.length >= 2) {
                             const headers = report.headersFn();
                             const tableData = report.dataFn().map(row => {
                                 const formattedRow = {};
                                 headers.forEach(header => {
                                     let value = row[header];
                                     if (header.includes('_Arrival') || header.includes('_Exit') || header.includes('_Change') || header.endsWith('_vs_National')) {
                                         value = typeof value === 'number' ? `${value.toFixed(2)}%` : value;
                                     }
                                     formattedRow[header] = value;
                                 });
                                 return formattedRow;
                             });

                             if (exportFormat === 'csv') {
                                 const ws = XLSX.utils.json_to_sheet(tableData, { header: headers });
                                 const wb = XLSX.utils.book_new();
                                 XLSX.utils.book_append_sheet(wb, ws, report.name);
                                 XLSX.writeFile(wb, `inventory_reports_${report.name}.csv`, { bookType: 'csv' });
                             } else {
                                 const arrivalHeaders = filterHeaders(headers, 'Arrival');
                                 const exitHeaders = filterHeaders(headers, 'Exit');
                                 const arrivalData = filterData(tableData, arrivalHeaders);
                                 const exitData = filterData(tableData, exitHeaders);
                                 const arrivalAoa = dataToAoaWithStyles(arrivalData, arrivalHeaders);
                                 const exitAoa = dataToAoaWithStyles(exitData, exitHeaders);
                                 const arrivalWs = XLSX.utils.aoa_to_sheet(arrivalAoa);
                                 const exitWs = XLSX.utils.aoa_to_sheet(exitAoa);
                                 const wb = XLSX.utils.book_new();
                                 XLSX.utils.book_append_sheet(wb, arrivalWs, `${report.name}_Arrival`);
                                 XLSX.utils.book_append_sheet(wb, exitWs, `${report.name}_Exit`);
                                 XLSX.writeFile(wb, `inventory_reports_${report.name}.xlsx`, { bookType: 'xlsx', compression: true });
                             }
                         }
                     });
                 }
             } catch (err) {
                 setError('Export failed: ' + err.message);
             }
         };

         return (
             <div className="flex items-center mb-6 space-x-4">
                 <select
                     value={exportFormat}
                     onChange={(e) => setExportFormat(e.target.value)}
                     className="p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                 >
                     <option value="csv">CSV (no formatting)</option>
                     <option value="xlsx">XLSX (with formatting)</option>
                     <option value="pdf">PDF</option>
                 </select>
                 <button
                     onClick={exportAllReports}
                     className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 text-sm font-medium"
                 >
                     Export All Reports
                 </button>
             </div>
         );
     };