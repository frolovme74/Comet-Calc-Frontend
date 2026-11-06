import { type FC, type FormEvent, useState } from 'react'
import { Alert, Button, Form, Spinner } from 'react-bootstrap'
import { Navigate, useNavigate } from 'react-router-dom'
import { ROUTES } from '../Routes'
import { authStorage, errorMessage, loginRequest } from '../modules/auth'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setUser } from '../store/userSlice'

// Вход: POST /api/users/login через axios, токен — в localStorage, пользователь — в Redux вручную
export const LoginPage: FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated)

  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (isAuthenticated) return <Navigate to={ROUTES.FEED} replace />

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const token = await loginRequest(login.trim(), password)
      authStorage.save(token, login.trim())
      dispatch(setUser(login.trim()))
      navigate(ROUTES.FEED)
    } catch (requestError) {
      setError(errorMessage(requestError, 'Не удалось войти'))
      setLoading(false)
    }
  }

  return (
    <main className="page">
      <header className="page__header">
        <h1 className="page__title">Вход</h1>
      </header>

      <Form className="form" onSubmit={handleSubmit}>
        <Form.Group className="form__field" controlId="login">
          <Form.Label>Логин</Form.Label>
          <Form.Control
            className="form__input"
            value={login}
            onChange={(event) => setLogin(event.target.value)}
            autoComplete="username"
            disabled={loading}
            required
          />
        </Form.Group>
        <Form.Group className="form__field" controlId="password">
          <Form.Label>Пароль</Form.Label>
          <Form.Control
            className="form__input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            disabled={loading}
            required
          />
        </Form.Group>

        {error && <Alert variant="danger" className="form__error">{error}</Alert>}

        <Button className="button button--wide" type="submit" disabled={loading || !login.trim() || !password}>
          {loading ? <Spinner animation="border" size="sm" /> : 'Войти'}
        </Button>
      </Form>
    </main>
  )
}
