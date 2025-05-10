function filledCell(cell) {
    return cell !== '' && cell != null;
}

function validateExcelFile(df, category) {
    const requiredColumns = ['Item Description', 'TDP% on Shelf on Arrival', 'TDP% on Shelf on Exit'];
    if (category === 'Supervisor') requiredColumns.push('RS');
    if (category === 'Market') requiredColumns.push('RS', 'Market');
    if (category === 'ROM') requiredColumns.push('ROM');
    const missing = requiredColumns.filter(col => !Object.keys(df[0] || {}).includes(col));
    return missing.length ? { valid: false, error: `Missing columns: ${missing.join(', ')}` } : { valid: true };
}

function processExcel(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const workbook = XLSX.read(e.target.result, { type: 'binary' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const df = XLSX.utils.sheet_to_json(sheet);
            if (!df.length) throw new Error('Empty file');

            df.forEach(row => {
                row['TDP% on Shelf on Arrival'] = parseFloat(row['TDP% on Shelf on Arrival']) || 0;
                row['TDP% on Shelf on Exit'] = parseFloat(row['TDP% on Shelf on Exit']) || 0;
            });

            const match = file.name.match(/^(C\d+)\s*[-_\s]?([^.]+)\.xlsx$/i);
            if (!match) throw new Error(`Invalid filename: ${file.name}. Expected format: C#_Category.xlsx (e.g., C7_Supervisor.xlsx)`);

            const [, cycle, categoryRaw] = match;
            const cleanedCategory = categoryRaw.trim().replace(/\s+/g, ' ');
            const validCategories = ['Supervisor', 'Market', 'ROM', 'National'];
            if (!validCategories.includes(cleanedCategory)) throw new Error(`Invalid category: ${cleanedCategory}. Valid categories: ${validCategories.join(', ')}`);

            const validation = validateExcelFile(df, cleanedCategory);
            if (!validation.valid) throw new Error(validation.error);

            let metrics = {};
            if (cleanedCategory === 'Supervisor') {
                const sups = [...new Set(df.map(row => row.RS))];
                sups.forEach(sup => {
                    const supDf = df.filter(row => row.RS === sup);
                    metrics[sup] = {};
                    supDf.forEach(row => {
                        metrics[sup][row['Item Description']] = {
                            Arrival: row['TDP% on Shelf on Arrival'] * 100,
                            Exit: row['TDP% on Shelf on Exit'] * 100
                        };
                    });
                });
            } else if (cleanedCategory === 'Market') {
                df.forEach(row => {
                    const supervisor = row.RS;
                    const market = row.Market;
                    if (!metrics[market]) {
                        metrics[market] = { supervisor, metrics: {} };
                    }
                    metrics[market].metrics[row['Item Description']] = {
                        Arrival: row['TDP% on Shelf on Arrival'] * 100,
                        Exit: row['TDP% on Shelf on Exit'] * 100
                    };
                });
            } else if (cleanedCategory === 'ROM') {
                const roms = [...new Set(df.map(row => row.ROM))];
                roms.forEach(rom => {
                    const romDf = df.filter(row => row.ROM === rom);
                    metrics[rom] = {};
                    romDf.forEach(row => {
                        metrics[rom][row['Item Description']] = {
                            Arrival: row['TDP% on Shelf on Arrival'] * 100,
                            Exit: row['TDP% on Shelf on Exit'] * 100
                        };
                    });
                });
            } else if (cleanedCategory === 'National') {
                metrics['National'] = {};
                df.forEach(row => {
                    metrics['National'][row['Item Description']] = {
                        Arrival: row['TDP% on Shelf on Arrival'] * 100,
                        Exit: row['TDP% on Shelf on Exit'] * 100
                    };
                });
            }

            callback({ cycle, category: cleanedCategory, metrics }, null);
        } catch (err) {
            callback(null, err.message);
        }
    };
    reader.onerror = () => callback(null, 'Failed to read file');
    reader.readAsBinaryString(file);
}