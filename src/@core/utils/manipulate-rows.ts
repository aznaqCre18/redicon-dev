export const manipulateRows = (rows: any[]) => {
  const newRows: any[] = []
  rows.forEach((row, index) => {
    newRows.push({
      ...row,
      rowNumber: index + 1,
      realId: row.id
    })
    newRows.push({
      ...row,
      rowsType: 'expandablerow',
      id: row.id + '-expandable',
      realId: row.id
    })
  })

  return newRows
}
