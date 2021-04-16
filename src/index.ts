import { logger } from '@vtfk/logger'
import glob from 'fast-glob'
import { PhoneInformation, TechstepRecord, TelenorReport } from './lib/types'
import { saveExcel } from './lib/save-excel'
import * as reports from './lib/get-report'
import { mkdirIfNotExists } from './lib/mkdir-if-not-exist'
import { getADUsersBulk } from './lib/get-aduser'
import { parse } from 'path'

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
    if (parse(path).name.startsWith('~$')) return
    techstepReport.push(...await reports.getTechstepReport(path))
  }))

  const telenorReport: TelenorReport[] = []
  await Promise.all(telenorReportPaths.map(async path => {
    if (parse(path).name.startsWith('~$')) return
    telenorReport.push(...await reports.getTelenorReport(path))
  }))

  if (reports.isMissingRequiredColumns) {
    logger('error', ['Please fix the missing columns described above.'])
    process.exit(1)
  }

  logger('info', [`Found ${techstepReportPaths.length} Techstep reports, with a total of ${techstepReport.length} records.`])
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

  const manufacturers: string[] = []
  userDeviceReport.forEach(device => {
    if (device.manufacturer === undefined || manufacturers.includes(device.manufacturer)) return
    manufacturers.push(device.manufacturer)
  })

  try {
    logger('info', ['Getting usernames from AD'])
    const users = userDeviceReport.map(deviceRecord => ({ givenname: deviceRecord.firstname, surname: deviceRecord.lastname }))
    // TODO: Check for duplicate names and warn about it
    const adUsers = await getADUsersBulk({ users })
    logger('info', ['Got usernames from AD', 'count', String(adUsers.users.length)])

    userDeviceReport.forEach(deviceRecord => {
      const user = adUsers.users.find(adUser => adUser.givenname === deviceRecord.firstname && adUser.surname === deviceRecord.lastname)
      if (typeof user !== 'undefined') deviceRecord.username = user?.username
    })
  } catch (error) {
    logger('warn', ['Couldn\'t get usernames', 'skipping..'])
  }

  logger('info', ['Found these manufacturers', manufacturers.join(', ')])

  logger('info', [`Filled ${userDeviceReport.length}/${telenorReport.length} records`])

  await saveExcel(outputReportPath, userDeviceReport)
  logger('info', [`Saved report to ${outputReportPath}`])

  const timeUsed = (new Date()).getTime() - startTime.getTime()
  logger('info', ['Done', 'Time used', `${timeUsed}ms`])
})().catch(console.error)
