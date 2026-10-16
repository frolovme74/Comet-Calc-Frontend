// Число с запятой: 75.92 → «75,92»
export const formatNum = (value: number | null | undefined): string =>
  value === null || value === undefined ? '—' : String(value).replace('.', ',')

// Склонение слова «год» после числа: 1 год, 3 года, 76 лет, 75,92 года
export const yearsWord = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return ''
  if (!Number.isInteger(value)) return 'года'
  const n100 = value % 100
  const n10 = value % 10
  if (n100 >= 11 && n100 <= 14) return 'лет'
  if (n10 === 1) return 'год'
  if (n10 >= 2 && n10 <= 4) return 'года'
  return 'лет'
}
