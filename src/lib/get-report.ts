import luhn from 'luhn-js'
import { TechstepRecord, TelenorReport, DeviceModel } from './types'
import { loadExcel } from './load-excel'

const deviceModels: DeviceModel = {}

export async function getTechstepReport (path: string): Promise<TechstepRecord[]> {
  const hasContent = (data: any): boolean => typeof data === 'string' && data.length > 0

  const techstepReportParser = await loadExcel(path)

  const techstepReport: TechstepRecord[] = []
  techstepReportParser.forEach(record => {
    const imei: string | null = generateCheckDigit(record['imei nummer'])
    if (imei === null) return

    const storage: RegExpMatchArray | null = hasContent(record.Produkt) ? record.Produkt.match(/\d+[KMGT]?B/i) : null
    let price: number
    if (typeof record['Omsetning eks MVA'] === 'number') {
      price = record['Omsetning eks MVA']
    } else {
      price = parseFloat(
        record['Omsetning eks MVA']
          .replace(/kr| /g, '')
          .replace(',', '.')
      )
    }

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
  })

  // The Techstep reports may leave out the "Produkt" field if it has been filled on another IMEI number.
  techstepReport.forEach(record => {
    if (!hasContent(record.product)) record.product = deviceModels[record.productNumber]

    const storage: RegExpMatchArray | null = record.product.match(/\d+[KMGT]?B/i)
    record.storage = storage?.[0]
  })

  return techstepReport
}

export async function getTelenorReport (path: string): Promise<TelenorReport[]> {
  const telenorReportParser = await loadExcel(path)

  const telenorReport: TelenorReport[] = []
  telenorReportParser.forEach(record => {
    const imei: string | null = generateCheckDigit(record.IMEI)
    if (imei === null) return

    telenorReport.push({
      imei,
      firstname: record['Bruker Fornavn'],
      lastname: record['Bruker Etternavn'],
      subscriptionStart: record['Abonnementets startdato']
    })
  })
  return telenorReport
}

function generateCheckDigit (imei: any): string | null {
  if (typeof imei === 'number') imei = imei.toString()
  if (typeof imei !== 'string' || imei.length < 14) return null
  if (imei.length === 14) return luhn.generate(imei)
  return imei
}
