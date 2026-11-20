export const isPages = import.meta.env.MODE === 'pages'
export const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path}`
