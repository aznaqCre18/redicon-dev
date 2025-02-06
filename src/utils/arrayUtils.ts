export const pluck = (arr: any[], key: string) => arr.map(i => i[key])

export const getUniqueValues = (array: any[]) =>
  array.filter((currentValue, index, arr) => arr.indexOf(currentValue) === index)
