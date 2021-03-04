import { PhoneInformation, TechstepRecord, TelenorReport } from './lib/types'
import { saveExcel } from './lib/save-excel'
import { getTechstepReport, getTelenorReport } from './lib/get-report'
import { mkdirIfNotExists } from './lib/mkdir-if-not-exist'
import glob from 'fast-glob'

const paths = [
  './data/techstep',
  './data/telenor'
]

;(async () => {
  if (mkdirIfNotExists(paths)) {
    console.log('Created missing directories..')
    console.log(`Put all Techstep reports in "${paths[0]}"`)
    console.log(`And put all Telenor reports in "${paths[1]}"`)
  }
  const techstepReportPaths = await glob('./data/techstep/*.xlsx', { onlyFiles: true })
  const telenorReportPaths = await glob('./data/telenor/*.xlsx', { onlyFiles: true })

  const techstepReport: TechstepRecord[] = []
  await Promise.all(techstepReportPaths.map(async path => {
    techstepReport.push(...await getTechstepReport(path))
  }))

  const telenorReport: TelenorReport[] = []
  await Promise.all(telenorReportPaths.map(async path => {
    telenorReport.push(...await getTelenorReport(path))
  }))

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

  await saveExcel('./data/device-report.xlsx', userDeviceReport)
})().catch(console.error)
