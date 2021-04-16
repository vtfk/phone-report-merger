import Excel from 'exceljs'
import { PhoneInformation } from './types'

export async function saveExcel (path: string, data: PhoneInformation[]): Promise<void> {
  const workbook = new Excel.Workbook()
  workbook.creator = 'https://github.com/vtfk/phone-report-merger'

  const worksheet = workbook.addWorksheet('Mobil-rapport')

  const headerRow = ['IMEI', 'Brukernavn', 'Fornavn', 'Etternavn', 'Produsent', 'Produkt', 'Produktnummer', 'Antall', 'Pris', 'Lagring']
  const dataRows = data.map(device => [device.imei, device.username, device.firstname, device.lastname, device.manufacturer, device.product, device.productNumber, device.amount, device.price, device.storage])
  dataRows.unshift(headerRow)

  worksheet.addRows(dataRows)

  const minLength = 10
  worksheet.columns.forEach(column => {
    let maxLength = 0
    column.values.forEach(row => {
      const currentLength = row?.toString().length ?? 0
      if (currentLength > maxLength) maxLength = currentLength
    })
    column.width = maxLength < minLength ? minLength : maxLength
  })

  await workbook.xlsx.writeFile(path)
}
