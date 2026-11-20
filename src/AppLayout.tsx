import type { FC } from 'react'
import { Outlet } from 'react-router-dom'
import { TabBar } from './components/TabBar'

// Общая оболочка со страницей и нижней панелью вкладок.
export const AppLayout: FC = () => (
  <div className="app">
    <Outlet />
    <TabBar />
  </div>
)
