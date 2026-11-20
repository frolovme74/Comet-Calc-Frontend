export const ROUTES = {
  FEED: '/feed',
  ADD: '/add',
  COMETS: '/comets',
  LOGIN: '/login',
}

export type RouteKeyType = keyof typeof ROUTES

export const ROUTE_LABELS: { [key in RouteKeyType]: string } = {
  FEED: 'Лента',
  ADD: 'Добавление',
  COMETS: 'Плитка',
  LOGIN: 'Вход',
}
