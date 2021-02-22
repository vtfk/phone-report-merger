import Excel from 'exceljs'
import { PhoneInformation } from './types'

export async function saveExcel (path: string, data: PhoneInformation[]): Promise<void> {
  const workbook = new Excel.Workbook()
  workbook.creator = 'https://github.com/vtfk/cherwell-mobile-report'

  const worksheet = workbook.addWorksheet('Mobil-rapport')

  const headerRow = ['IMEI', 'Brukernavn', 'Fornavn', 'Etternavn', 'Produkt', 'Produktnummer', 'Antall', 'Pris', 'Lagring']
  const dataRows = data.map(device => [device.imei, '', device.firstname, device.lastname, device.product, device.productNumber, device.amount, device.price, device.storage])
  dataRows.unshift(headerRow)

  worksheet.addRows(dataRows)

  await workbook.xlsx.writeFile(path)
}
