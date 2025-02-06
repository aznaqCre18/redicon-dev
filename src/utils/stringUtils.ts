export const isEmpty = (str: string) => {
  return !str || str.length === 0
}

export const isset = (str: string) => {
  return !isEmpty(str)
}

export const isEmptyReplace = (str: string, replace: string) => {
  return !str || str.length === 0 ? replace : str
}

export const toCamelCase = (str: string) => {
  return str
    .replace(/\s(.)/g, function ($1) {
      return $1.toUpperCase()
    })
    .replace(/\s/g, '')
    .replace(/^(.)/, function ($1) {
      return $1.toLowerCase()
    })
}

export const toUpperFirst = (str: string) => {
  return str.replace(/\w\S*/g, word => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  })
}

export const randomString = (length: number) => {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return text
}

export const autoIncrementString = (str: string) => {
  let newStr = str.replace(/\d+$/, match => {
    const number = parseInt(match) + 1
    const length = match.length

    return number.toString().padStart(length, '0')
  })

  if (str == newStr) {
    newStr = str + '2'
  }

  return newStr
}
