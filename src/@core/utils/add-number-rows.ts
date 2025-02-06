export const addNumberRows = (rows: any[]) => {
  const newRows: any[] = []
  rows.forEach((row, index) => {
    newRows.push({
      ...row,
      rowNumber: index + 1,
      realId: row.id
    })
  })

  return newRows
}
