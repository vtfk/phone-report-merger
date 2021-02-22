import csvParse, { Options as CsvParserOptions } from 'csv-parse'
import { createReadStream, writeFileSync } from 'fs'

const csvParserOptions: CsvParserOptions = {
  delimiter: ';',
  columns: true
}

;(async () => {
  const techstepReportParser = createReadStream('./data/techstep.csv').pipe(csvParse(csvParserOptions))
  const techstepReport: TechstepRecord[] = []
  for await (const record of techstepReportParser) {
    const storage: RegExpMatchArray | null = record.Produkt.match(/\d+[KMGT]?B/i)
    techstepReport.push({
      date: record.Dato,
      product: record.Produkt,
      imei: record['imei nummer'],
      productNumber: record.Varenummer,
      amount: parseInt(record.Antall),
      price: record['Omsetning eks MVA'],
      storage: storage?.[0]
    })
  }
  // TODO: Loop over and fill in missing information based on "Varenummer"

  const records = []
  const parser = createReadStream('./data/telenor.csv').pipe(csvParse(csvParserOptions))
  for await (const record of parser) {
    if (record.IMEI === '') continue
    records.push(record)
  }
  console.log(techstepReport.length)
  writeFileSync('./data/output.json', JSON.stringify(techstepReport, null, 2))
})().catch(console.error)

interface TechstepRecord {
  date: Date
  product: string
  productNumber: string
  imei: string
  amount: number
  price: number
  storage?: string
}

interface PhoneInformation {

}

/* Required data

IMEI nummer
 Modell
 Pris
 Storage
 Bruker av telefonen

Brukernavn
  Fullt navn
*/
