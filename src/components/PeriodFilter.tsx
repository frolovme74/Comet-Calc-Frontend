import type { CSSProperties, FC } from 'react'
import { Button, Form } from 'react-bootstrap'
import { formatNum } from '../modules/format'

interface RangeFieldProps {
  id: string
  label: string
  value: number
  min: number
  max: number
  // какую часть дорожки закрасить: от начала до ползунка («до») или от ползунка до конца («от»)
  fill: 'start' | 'end'
  disabled?: boolean
  onChange: (value: number) => void
}

// Один слайдер фильтра: подпись, текущее значение и Form.Range
export const RangeField: FC<RangeFieldProps> = ({ id, label, value, min, max, fill, disabled, onChange }) => (
  <Form.Group
    className={`range range--fill-${fill}`}
    controlId={id}
    style={{ '--fill': `${((value - min) / (max - min)) * 100}%` } as CSSProperties}
  >
    <div className="range__head">
      <Form.Label className="range__label">{label}</Form.Label>
      <output className="range__value" htmlFor={id}>{formatNum(value)}</output>
    </div>
    <Form.Range
      className="range__input"
      min={min}
      max={max}
      step={1}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  </Form.Group>
)

interface PeriodFilterProps {
  from: number
  to: number
  min: number
  max: number
  appliedFrom?: number
  appliedTo?: number
  loading?: boolean
  onFromChange: (value: number) => void
  onToChange: (value: number) => void
  onSubmit: () => void
  onReset: () => void
}

const appliedText = (from?: number, to?: number): string => {
  if (from !== undefined && to !== undefined) return `${formatNum(from)} – ${formatNum(to)}`
  if (from !== undefined) return `от ${formatNum(from)}`
  if (to !== undefined) return `до ${formatNum(to)}`
  return 'все'
}

// Фильтр плитки по периоду обращения «от» и «до».
// Значения слайдеров хранит страница (from/to), применённый фильтр — appliedFrom/appliedTo из адреса.
export const PeriodFilter: FC<PeriodFilterProps> = ({
  from,
  to,
  min,
  max,
  appliedFrom,
  appliedTo,
  loading,
  onFromChange,
  onToChange,
  onSubmit,
  onReset,
}) => {
  const isFiltered = appliedFrom !== undefined || appliedTo !== undefined

  return (
    <Form
      className="filter"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <div className="filter__row">
        <span className="filter__label">Период обращения, лет</span>
        <span className="filter__value">{appliedText(appliedFrom, appliedTo)}</span>
      </div>

      <RangeField id="min_orbital_period" label="от" fill="end" value={from} min={min} max={max} disabled={loading} onChange={onFromChange} />
      <RangeField id="max_orbital_period" label="до" fill="start" value={to} min={min} max={max} disabled={loading} onChange={onToChange} />

      <div className="range__scale">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i}>{Math.round(min + ((max - min) * i) / 4)}</span>
        ))}
      </div>

      <div className="filter__actions">
        <Button className="button" type="submit" disabled={loading}>
          Показать
        </Button>
        {isFiltered && (
          <Button className="button button--secondary" variant="light" disabled={loading} onClick={onReset}>
            Сбросить
          </Button>
        )}
      </div>
    </Form>
  )
}
