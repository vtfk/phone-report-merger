import { logger } from '@vtfk/logger'
import glob from 'fast-glob'
import { PhoneInformation, TechstepRecord, TelenorReport } from './lib/types'
import { saveExcel } from './lib/save-excel'
import { getTechstepReport, getTelenorReport } from './lib/get-report'
import { mkdirIfNotExists } from './lib/mkdir-if-not-exist'

const outputReportPath = './data/device-report.xlsx'
const paths = [
  './data/techstep',
  './data/telenor'
]

;(async () => {
  const startTime = new Date()
  logger('info', ['Start'])

  if (mkdirIfNotExists(paths)) {
    logger('warn', ['Created missing directories..'])
    logger('warn', [`Please put all Techstep reports (.xlsx) in "${paths[0]}"`])
    logger('warn', [`And put all Telenor reports (.xlsx) in "${paths[1]}"`])
    logger('warn', ['Then re-run the script.'])
    process.exit(0)
  }
  const techstepReportPaths = await glob('./data/techstep/*.xlsx', { onlyFiles: true })
  const telenorReportPaths = await glob('./data/telenor/*.xlsx', { onlyFiles: true })

  if (techstepReportPaths.length < 1) {
    logger('error', [`Couldn't find any (.xlsx) files in "${paths[0]}"`])
  }
  if (telenorReportPaths.length < 1) {
    logger('error', [`Couldn't find any (.xlsx) files in "${paths[1]}"`])
  }
  if (techstepReportPaths.length < 1 && telenorReportPaths.length < 1) {
    process.exit(1)
  }

  logger('info', ['Importing reports...'])

  const techstepReport: TechstepRecord[] = []
  await Promise.all(techstepReportPaths.map(async path => {
    techstepReport.push(...await getTechstepReport(path))
  }))

  logger('info', [`Found ${techstepReportPaths.length} Techstep reports, with a total of ${techstepReport.length} records.`])

  const telenorReport: TelenorReport[] = []
  await Promise.all(telenorReportPaths.map(async path => {
    telenorReport.push(...await getTelenorReport(path))
  }))

  logger('info', [`Found ${telenorReportPaths.length} Telenor reports, with a total of ${telenorReport.length} records.`])

  const userDeviceReport: PhoneInformation[] = []
  telenorReport.forEach(record => {
    const device = techstepReport.find(deviceRecord => deviceRecord.imei === record.imei)
    if (typeof device === 'undefined') return null
    userDeviceReport.push({
      ...record,
      ...device
    })
  })

  logger('info', [`Filled ${userDeviceReport.length}/${telenorReport.length} records`])

  await saveExcel(outputReportPath, userDeviceReport)
  logger('info', [`Saved report to ${outputReportPath}`])

  const timeUsed = (new Date()).getTime() - startTime.getTime()
  logger('info', ['Done', 'Time used', `${timeUsed}ms`])
})().catch(console.error)
