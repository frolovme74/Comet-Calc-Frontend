import type { FC, ReactNode } from 'react'
import { Nav, Navbar } from 'react-bootstrap'
import { Link, useLocation } from 'react-router-dom'
import { ROUTES, ROUTE_LABELS, type RouteKeyType } from '../Routes'

interface TabItem {
  key: RouteKeyType
  icon: ReactNode
  disabled?: boolean
}

// 4 пункта меню; «Добавление» и «Вход» в ЛР5 недоступны (появятся с авторизацией в ЛР6)
const TABS: TabItem[] = [
  { key: 'FEED', icon: <path d="M8 5v14l11-7z" /> },
  { key: 'ADD', icon: <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" />, disabled: true },
  { key: 'COMETS', icon: <path d="M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z" /> },
  {
    key: 'LOGIN',
    icon: <path d="M10 17v-3H3v-4h7V7l5 5zm1-14h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-8v-2h8V5h-8z" />,
    disabled: true,
  },
]

export const TabBar: FC = () => {
  const { pathname } = useLocation()

  return (
    <Navbar className="tabbar" variant="dark">
      <Nav className="tabbar__nav">
        {TABS.map(({ key, icon, disabled }) => (
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
        ))}
      </Nav>
    </Navbar>
  )
}
