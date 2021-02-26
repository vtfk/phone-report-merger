import Excel, { RowModel } from 'exceljs'

export async function loadExcel (path: string, headerRow: number = 1): Promise<any[]> {
  const workbook = new Excel.Workbook()
  await workbook.xlsx.readFile(path)
  const worksheet = workbook.worksheets[0]

  // Missing property in declaration file
  /* @ts-expect-error */
  const rows = worksheet.model.rows as RowModel[]

  let headerRowIndex: number
  let header: string[]
  const sheet: any[] = []
  rows.forEach((row, y) => {
    const rowColumnCount = row.cells.filter(cell => typeof cell.value !== 'undefined').length

    if (headerRowIndex === undefined && rowColumnCount === worksheet.actualColumnCount) {
      console.log(`Cells: ${row.cells.length} & Y: ${y} - Path: ${path}`)
      headerRowIndex = y
      const formatCell = (cell: any): string => cell.value?.toString().trim()
      header = rows[headerRowIndex].cells.map(formatCell)
    } else if (headerRowIndex === undefined) return

    const colIndex = y - headerRowIndex

    sheet[colIndex] = {}
    row.cells.forEach((cell, x) => {
      sheet[colIndex][header[x]] = cell.value
    })
  })
  return sheet
}
