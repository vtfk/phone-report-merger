import csvParse, { Options as CsvParserOptions } from 'csv-parse'
import { createReadStream } from 'fs'
import luhn from 'luhn-js'
import { TechstepRecord, TelenorReport, DeviceModel } from './types'

const csvParserOptions: CsvParserOptions = {
  delimiter: ';',
  columns: true,
  trim: true
}

const deviceModels: DeviceModel = {}

// TODO: Loop over and fill in missing information based on "Varenummer"
export async function getTechstepReport (path: string): Promise<TechstepRecord[]> {
  const hasContent = (data: any): boolean => typeof data === 'string' && data.length > 0

  const techstepReportParser = createReadStream(path).pipe(csvParse(csvParserOptions))
  const techstepReport: TechstepRecord[] = []
  for await (const record of techstepReportParser) {
    const imei: string | null = generateCheckDigit(record['imei nummer'])
    if (imei === null) continue

    const storage: RegExpMatchArray | null = record.Produkt.match(/\d+[KMGT]?B/i)
    const price = parseFloat(
      record['Omsetning eks MVA']
        .replace(/kr| /g, '')
        .replace(',', '.')
    )

    if (typeof deviceModels[record.Varenummer] === 'undefined' && hasContent(record.Produkt)) {
      deviceModels[record.Varenummer] = record.Produkt
    }

    techstepReport.push({
      imei,
      product: record.Produkt,
      productNumber: record.Varenummer,
      amount: parseInt(record.Antall),
      price,
      storage: storage?.[0]
    })
  }

  // The Techstep reports may leave out the "Produkt" field if it has been filled on another IMEI number.
  techstepReport.forEach(record => {
    if (!hasContent(record.product)) record.product = deviceModels[record.productNumber]

    const storage: RegExpMatchArray | null = record.product.match(/\d+[KMGT]?B/i)
    record.storage = storage?.[0]
  })

  return techstepReport
}

export async function getTelenorReport (path: string): Promise<TelenorReport[]> {
  const telenorReportParser = createReadStream(path).pipe(csvParse(csvParserOptions))
  const telenorReport: TelenorReport[] = []
  for await (const record of telenorReportParser) {
    const imei: string | null = generateCheckDigit(record.IMEI)
    if (imei === null) continue

    telenorReport.push({
      imei,
      firstname: record['Bruker Fornavn'],
      lastname: record['Bruker Etternavn']
    })
  }
  return telenorReport
}

function generateCheckDigit (imei: string): string | null {
  if (typeof imei !== 'string' || imei.length < 14) return null
  if (imei.length === 14) return luhn.generate(imei)
  return imei
}
