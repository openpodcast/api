// format a date in format YYYY-MM-DD
const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${year}-${month}-${day}`
}

const formDateTime = (date: Date): string => {
    return date.toISOString()
}

const nowString = (): string => {
    return formDateTime(new Date())
}

export { formatDate, formDateTime, nowString }
