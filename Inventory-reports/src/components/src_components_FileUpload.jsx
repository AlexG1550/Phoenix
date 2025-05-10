const FileUpload = ({ setData, setError, isUploading, setIsUploading }) => {
    const handleFileUpload = (event) => {
        setIsUploading(true);
        const files = event.target.files;
        Array.from(files).forEach(file => {
            processExcel(file, (result, error) => {
                if (error) {
                    setError(`Error processing ${file.name}: ${error}. Ensure file follows naming convention (e.g., C7_Supervisor.xlsx) and includes required columns.`);
                    setIsUploading(false);
                    return;
                }
                setData(prev => ({
                    ...prev,
                    [result.category]: {
                        ...prev[result.category],
                        [result.cycle]: result.metrics
                    }
                }));
                setError('');
                setIsUploading(false);
            });
        });
    };

    return (
        <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Files</label>
            <input
                type="file"
                multiple
                accept=".xlsx"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={isUploading}
            />
            {isUploading && (
                <div className="flex items-center mt-2">
                    <svg className="animate-spin h-5 w-5 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-gray-600">Processing files...</span>
                </div>
            )}
        </div>
    );
};