import luhn from 'luhn-js'
import { TechstepRecord, TelenorReport, DeviceModel } from './types'
import { loadExcel } from './load-excel'
import { logger } from '@vtfk/logger'

const techstepRequiredColumns = ['Produkt', 'imei nummer', 'Varenummer', 'Antall', 'Omsetning eks MVA']
const telenorRequiredColumns = ['Abonnementets startdato', 'Bruker Etternavn', 'Bruker Fornavn', 'IMEI']
export let isMissingRequiredColumns = false

const deviceModels: DeviceModel = {}

const parsedTechstepImeis: string[] = []
const parsedTelenorImeis: string[] = []

export async function getTechstepReport (path: string): Promise<TechstepRecord[]> {
  const hasContent = (data: any): boolean => typeof data === 'string' && data.length > 0

  const techstepReportParser = await loadExcel(path)

  const reportColumns = Object.keys(techstepReportParser[0])
  const missingRequiredColumns = techstepRequiredColumns.filter(requiredColumn => !reportColumns.includes(requiredColumn))
  if (missingRequiredColumns.length > 0) {
    logger('error', ['Missing required columns in Techstep report!', missingRequiredColumns.join(', '), path])
    isMissingRequiredColumns = true
    return []
  }

  const techstepReport: TechstepRecord[] = []
  techstepReportParser.forEach(record => {
    const imei: string | null = generateCheckDigit(record['imei nummer'])
    if (imei === null || parsedTechstepImeis.includes(imei)) return

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

    parsedTechstepImeis.push(imei)
  })

  // The Techstep reports may leave out the "Produkt" field if it has been filled on another IMEI number.
  techstepReport.forEach(record => {
    if (!hasContent(record.product)) record.product = deviceModels[record.productNumber]

    const storage: RegExpMatchArray | null = record.product.match(/\d+[KMGT]?B/i)
    record.storage = storage?.[0]

    const manufacturer: RegExpMatchArray | null = record.product.match(/^(?<manufacturer>\w+) /i)
    if (manufacturer?.groups?.manufacturer !== undefined) {
      const fullMatch = manufacturer[0]
      record.product = record.product.replace(fullMatch, '')

      record.manufacturer = manufacturer.groups.manufacturer
    }
  })

  return techstepReport
}

export async function getTelenorReport (path: string): Promise<TelenorReport[]> {
  const telenorReportParser = await loadExcel(path)

  const reportColumns = Object.keys(telenorReportParser[0])
  const missingRequiredColumns = telenorRequiredColumns.filter(requiredColumn => !reportColumns.includes(requiredColumn))
  if (missingRequiredColumns.length > 0) {
    logger('error', ['Missing required columns in Telenor report!', missingRequiredColumns.join(', '), path])
    isMissingRequiredColumns = true
    return []
  }

  const telenorReport: TelenorReport[] = []
  telenorReportParser.forEach(record => {
    const imei: string | null = generateCheckDigit(record.IMEI)
    if (imei === null || parsedTelenorImeis.includes(imei)) return

    telenorReport.push({
      imei,
      firstname: record['Bruker Fornavn'],
      lastname: record['Bruker Etternavn'],
      subscriptionStart: record['Abonnementets startdato']
    })

    parsedTelenorImeis.push(imei)
  })
  return telenorReport
}

function generateCheckDigit (imei: any): string | null {
  if (typeof imei === 'number') imei = imei.toString()
  if (typeof imei !== 'string' || imei.length < 14) return null
  if (imei.length === 14) return luhn.generate(imei)
  return imei
}
