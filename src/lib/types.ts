export interface TechstepRecord {
  manufacturer?: string
  product: string
  productNumber: string
  imei: string
  amount: number
  price: number
  storage?: string
}

export interface TelenorReport {
  firstname: string
  lastname: string
  imei: string
  subscriptionStart: Date
}

export interface AdditionalColumns {
  username?: string
}

export type PhoneInformation = TechstepRecord & TelenorReport & AdditionalColumns

export interface DeviceModel {
  [model: string]: string
}

export interface GetADUsersOptions {
  users: Array<{
    givenname: string
    surname: string
  }>
}

export interface GetADUsersResult {
  users: Array<{
    givenname: string
    surname: string
    username: string
  }>
}
