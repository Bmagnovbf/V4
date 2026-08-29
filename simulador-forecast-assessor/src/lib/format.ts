const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const BRL_DEC = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function fmt(value: number): string {
  return BRL.format(value)
}

export function fmtDec(value: number): string {
  return BRL_DEC.format(value)
}

export function fmtPct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function fmtInt(value: number): string {
  return Math.round(value).toLocaleString('pt-BR')
}

export function fmtMultiplier(value: number): string {
  return `${value.toFixed(1)}×`
}
