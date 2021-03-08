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

export type PhoneInformation = TechstepRecord & TelenorReport

export interface DeviceModel {
  [model: string]: string
}
