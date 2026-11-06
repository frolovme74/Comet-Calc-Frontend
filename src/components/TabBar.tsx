import { type FC, type ReactNode, useState } from 'react'
import { Nav, Navbar, Spinner } from 'react-bootstrap'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ROUTES, ROUTE_LABELS, type RouteKeyType } from '../Routes'
import { authStorage, logoutRequest } from '../modules/auth'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { clearUser } from '../store/userSlice'

interface TabItem {
  key: RouteKeyType
  icon: ReactNode
  // пункт только для вошедшего пользователя
  authOnly?: boolean
}

const TABS: TabItem[] = [
  { key: 'FEED', icon: <path d="M8 5v14l11-7z" /> },
  { key: 'ADD', icon: <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" />, authOnly: true },
  { key: 'COMETS', icon: <path d="M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z" /> },
]

const LOGIN_ICON = <path d="M10 17v-3H3v-4h7V7l5 5zm1-14h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-8v-2h8V5h-8z" />
const LOGOUT_ICON = <path d="M14 17v-3H7v-4h7V7l5 5zM5 3h8v2H5v14h8v2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />

// Нижнее меню из 4 пунктов. Гость: «Добавление» недоступно, последний пункт — «Вход».
// Пользователь: «Добавление» доступно, последний пункт — «Выход».
export const TabBar: FC = () => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { isAuthenticated, login } = useAppSelector((state) => state.user)
  const [loggingOut, setLoggingOut] = useState(false)

  // Выход: POST /api/users/logout через axios, затем токен удаляется и пользователь сбрасывается в Redux
  // (вместе с ним сбрасывается фильтр). Даже если сервис недоступен, выход на клиенте выполняется.
  const handleLogout = async () => {
    const token = authStorage.getToken()
    setLoggingOut(true)
    try {
      if (token) await logoutRequest(token)
    } catch {
      // токен уже недействителен или сервис недоступен — всё равно выходим
    }
    authStorage.clear()
    dispatch(clearUser())
    setLoggingOut(false)
    navigate(ROUTES.FEED)
  }

  return (
    <Navbar className="tabbar" variant="dark">
      <Nav className="tabbar__nav">
        {TABS.map(({ key, icon, authOnly }) => {
          const disabled = authOnly && !isAuthenticated
          return (
            <Nav.Link
              key={key}
              as={Link}
              to={ROUTES[key]}
              disabled={disabled}
              active={pathname.startsWith(ROUTES[key])}
              className="tabbar__item"
              title={disabled ? 'Доступно после входа' : undefined}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">{icon}</svg>
              <span>{ROUTE_LABELS[key]}</span>
            </Nav.Link>
          )
        })}

        {isAuthenticated ? (
          <Nav.Link
            as="button"
            className="tabbar__item"
            onClick={handleLogout}
            disabled={loggingOut}
            title={`Выйти (${login})`}
          >
            {loggingOut ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">{LOGOUT_ICON}</svg>
            )}
            <span>Выход</span>
          </Nav.Link>
        ) : (
          <Nav.Link
            as={Link}
            to={ROUTES.LOGIN}
            active={pathname.startsWith(ROUTES.LOGIN)}
            className="tabbar__item"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">{LOGIN_ICON}</svg>
            <span>{ROUTE_LABELS.LOGIN}</span>
          </Nav.Link>
        )}
      </Nav>
    </Navbar>
  )
}
