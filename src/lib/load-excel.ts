import Excel, { RowModel } from 'exceljs'

export async function loadExcel (path: string, headerRow: number = 1): Promise<any[]> {
  const workbook = new Excel.Workbook()
  await workbook.xlsx.readFile(path)

  // Missing property in declaration file
  /* @ts-expect-error */
  const rows = workbook.worksheets[0].model.rows as RowModel[]
  const headerRowIndex = headerRow - 1
  const header = rows[headerRowIndex].cells.map(cell => cell.value?.toString().trim()) as string[]

  const sheet: any[] = []
  rows.forEach((row, y) => {
    const colIndex = y - headerRowIndex - 1
    if (y <= headerRowIndex) return
    sheet[colIndex] = {}
    row.cells.forEach((cell, x) => {
      sheet[colIndex][header[x]] = cell.value
    })
  })
  return sheet
}
