import type { FC } from 'react'
import { Outlet } from 'react-router-dom'
import { TabBar } from './components/TabBar'

// Общая оболочка: узкая колонка как экран телефона, контент страницы и нижняя панель вкладок
export const AppLayout: FC = () => (
  <div className="app">
    <Outlet />
    <TabBar />
  </div>
)
