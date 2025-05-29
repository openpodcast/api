// Utility functions for CSV conversion

// Convert an array of objects to CSV format
export function arrayToCSV(data: any[]): string {
    if (!data || data.length === 0) {
        return ''
    }

    // Get headers from the first object
    const headers = Object.keys(data[0])

    // Create CSV header row
    const csvHeaders = headers.join(',')

    // Create CSV data rows
    const csvRows = data.map((row) => {
        return headers
            .map((header) => {
                const value = row[header]
                // Handle null/undefined values
                if (value === null || value === undefined) {
                    return ''
                }
                // Escape quotes and wrap in quotes if contains comma, quote, or newline
                const stringValue = String(value)
                if (
                    stringValue.includes(',') ||
                    stringValue.includes('"') ||
                    stringValue.includes('\n')
                ) {
                    return `"${stringValue.replace(/"/g, '""')}"`
                }
                return stringValue
            })
            .join(',')
    })

    return [csvHeaders, ...csvRows].join('\n')
}

// Convert various data types to CSV
export function dataToCSV(data: any): string {
    if (!data) {
        return ''
    }

    // If it's already an array of objects, convert directly
    if (Array.isArray(data)) {
        return arrayToCSV(data)
    }

    // If it's a single object, wrap in array
    if (typeof data === 'object') {
        return arrayToCSV([data])
    }

    // For primitive values, create a simple CSV
    return String(data)
}
