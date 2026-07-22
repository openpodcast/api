declare module 'hbs' {
    const hbs: {
        registerPartial: (name: string, partial: string) => void
        registerPartials: (directory: string) => void
    }

    export default hbs
}
