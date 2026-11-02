export const pad = (n: number) => String(n).padStart(2, '0')

export const toISODate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const today = () => toISODate(new Date())

export const addDays = (iso: string, days: number) => {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

export const nowTime = () => {
  const d = new Date()
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const monthKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`

export const monthsBack = (n: number) => {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() - n)
  return monthKey(d)
}

const WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
const WEEKDAYS_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
const MONTHS_SHORT = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']

export const weekday = (iso: string) => WEEKDAYS[new Date(iso + 'T12:00:00').getDay()]
export const weekdayShort = (iso: string) => WEEKDAYS_SHORT[new Date(iso + 'T12:00:00').getDay()]

export const formatDate = (iso: string) => {
  const d = new Date(iso + 'T12:00:00')
  return `${d.getDate()}. ${MONTHS[d.getMonth()]}`
}

export const formatDateLong = (iso: string) => `${weekday(iso)}, ${formatDate(iso)}`

export const monthLabel = (key: string, short = false) => {
  const [, m] = key.split('-').map(Number)
  return short ? MONTHS_SHORT[m - 1] : MONTHS[m - 1]
}

export const relativeDay = (iso: string) => {
  const t = today()
  if (iso === t) return 'Heute'
  if (iso === addDays(t, 1)) return 'Morgen'
  if (iso === addDays(t, -1)) return 'Gestern'
  return formatDateLong(iso)
}

// Montag der Woche, in der iso liegt
export const startOfWeek = (iso: string) => {
  const d = new Date(iso + 'T12:00:00')
  const diff = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - diff)
  return toISODate(d)
}

export const uid = () => Math.random().toString(36).slice(2, 10)

export const formatDateTime = (isoTs: string) => {
  const d = new Date(isoTs)
  return `${relativeDay(toISODate(d))}, ${pad(d.getHours())}:${pad(d.getMinutes())} Uhr`
}

// Monat (YYYY-MM) um n Monate verschieben
export const addMonths = (key: string, n: number) => {
  const [y, m] = key.split('-').map(Number)
  return monthKey(new Date(y, m - 1 + n, 1))
}
