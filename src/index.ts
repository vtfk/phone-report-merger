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
    console.log(`Put all Techstep reports (.xlsx) in "${paths[0]}"`)
    console.log(`And put all Telenor reports (.xlsx) in "${paths[1]}"`)
    console.log('Then re-run the script.')
    process.exit(0)
  }
  const techstepReportPaths = await glob('./data/techstep/*.xlsx', { onlyFiles: true })
  const telenorReportPaths = await glob('./data/telenor/*.xlsx', { onlyFiles: true })

  if (techstepReportPaths.length < 1) {
    console.log(`Couldn't find any (.xlsx) files in "${paths[0]}"`)
  }
  if (telenorReportPaths.length < 1) {
    console.log(`Couldn't find any (.xlsx) files in "${paths[1]}"`)
  }
  if (techstepReportPaths.length < 1 && telenorReportPaths.length < 1) {
    process.exit(1)
  }

  const techstepReport: TechstepRecord[] = []
  await Promise.all(techstepReportPaths.map(async path => {
    techstepReport.push(...await getTechstepReport(path))
  }))

  console.log(`Found ${techstepReportPaths.length} Techstep reports, with a total of ${techstepReport.length} records.`)

  const telenorReport: TelenorReport[] = []
  await Promise.all(telenorReportPaths.map(async path => {
    telenorReport.push(...await getTelenorReport(path))
  }))

  console.log(`Found ${telenorReportPaths.length} Telenor reports, with a total of ${telenorReport.length} records.`)

  const userDeviceReport: PhoneInformation[] = []
  telenorReport.forEach(record => {
    const device = techstepReport.find(deviceRecord => deviceRecord.imei === record.imei)
    if (typeof device === 'undefined') return null
    userDeviceReport.push({
      ...record,
      ...device
    })
  })

  console.log(`Filled ${userDeviceReport.length}/${telenorReport.length} records`)

  await saveExcel('./data/device-report.xlsx', userDeviceReport)
})().catch(console.error)
