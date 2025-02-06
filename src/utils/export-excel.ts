import ExcelJS from 'exceljs'

export type ExportExcelColumnsData = {
  title: string
  width?: number
  key: string
}

export const exportExcel = async (
  name: string,
  title: string,
  fieldData: object,
  columns: ExportExcelColumnsData[],
  data: any[]
) => {
  // Create WorkBook
  const wb = new ExcelJS.Workbook()

  //properties excel
  wb.creator = 'Motapos'
  wb.lastModifiedBy = 'Motapos'
  wb.created = new Date()
  wb.modified = new Date()
  wb.lastPrinted = new Date()

  // Create Sheet
  const ws = wb.addWorksheet()

  const AtoZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  // Set lebar Column menggunakan key bisa dengan huruf bisa dengan index angka
  const columnsExcelWidth = columns.map((column, index) => {
    return {
      key: AtoZ[index + 2],
      width: column.width ?? 20
    }
  })

  ws.columns = [
    {
      key: 'A',
      width: 5
    },
    ...columnsExcelWidth
  ]

  // Set value cell untuk title
  ws.getRow(1).getCell('A').value = title

  // Set font Style
  ws.getRow(1).getCell('A').font = {
    bold: true,
    size: 16
  }

  // merge cell dari A1 sampai C1
  ws.mergeCells('A1', `${AtoZ[columns.length]}1`)

  // jika ada filedData maka kita buat row baru
  if (Object.keys(fieldData).length > 0) {
    Object.keys(fieldData).forEach((key, index) => {
      const rowFieldData = ws.getRow(index + 3)

      rowFieldData.getCell(1).value = key
      rowFieldData.getCell(1).font = {
        bold: true,
        size: 11
      }

      // merge cell dari A1 sampai C1
      ws.mergeCells(`A${index + 3}`, `B${index + 3}`)

      rowFieldData.getCell(3).value = (fieldData as any)[key]
      rowFieldData.getCell(3).font = {
        bold: true,
        size: 11
      }
    })
  }

  // inisiasi pada baris ke 3 jadi Header table
  const rowHeader = ws.getRow(Object.keys(fieldData).length + 4)

  // Buat styling cell header menggunakan perulangan agar tidak per cell kita bikinnya

  for (let i = 1; i <= columns.length + 1; i++) {
    // Untuk border table
    rowHeader.getCell(i).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
    // Untuk fill color cell
    rowHeader.getCell(i).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '191970' }
    }
    // Untuk alignment text dalam cell
    rowHeader.getCell(i).alignment = {
      vertical: 'middle',
      horizontal: 'center'
    }
    // Untuk set font
    rowHeader.getCell(i).font = {
      bold: true,
      size: 11,
      color: { argb: 'FFFFFF' }
    }
  }

  // Isi data Header
  rowHeader.getCell(1).value = 'No'
  columns.forEach((column, index) => {
    rowHeader.getCell(index + 2).value = column.title
  })

  // Buat datanya menggunakan perulangan
  data.forEach((item, index) => {
    const row = ws.getRow(index + Object.keys(fieldData).length + 5)
    row.getCell(1).value = index + 1
    columns.forEach((column, index) => {
      row.getCell(index + 2).value = item[column.key]
    })
  })

  //membuat buffer file
  const buf = await wb.xlsx.writeBuffer()

  //download file dari browser dan menamai filenya
  const a = document.createElement('a')
  document.body.appendChild(a)
  const blob = new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })

  const url = window.URL.createObjectURL(blob)
  // change name and self download
  a.href = url
  a.download = `${name}.xlsx`
  a.target = '_self'
  a.click()
}
