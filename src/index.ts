import { PhoneInformation, TechstepRecord } from './lib/types'
import { saveExcel } from './lib/save-excel'
import { getTechstepReport, getTelenorReport } from './lib/get-report'
import { writeFileSync } from 'fs'

;(async () => {
  const techstepReportPaths = [
    './data/techstep-20.csv',
    './data/techstep-18-19.csv'
  ]
  const techstepReport: TechstepRecord[] = []
  await Promise.all(techstepReportPaths.map(async path => {
    techstepReport.push(...await getTechstepReport(path))
  }))

  const telenorReport = await getTelenorReport('./data/telenor.csv')

  const userDeviceReport: PhoneInformation[] = []
  telenorReport.forEach(record => {
    const device = techstepReport.find(deviceRecord => deviceRecord.imei === record.imei)
    if (typeof device === 'undefined') return null
    userDeviceReport.push({
      ...record,
      ...device
    })
  })

  console.log(`Filled ${userDeviceReport.length}/${telenorReport.length} reports`)

  writeFileSync('./data/output.json', JSON.stringify(userDeviceReport, null, 2))
  await saveExcel('./data/device-report.xlsx', userDeviceReport)
})().catch(console.error)
