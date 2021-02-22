export interface TechstepRecord {
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
}

export type PhoneInformation = TechstepRecord & TelenorReport

/* Required data

IMEI nummer
 Modell
 Pris
 Storage
 Bruker av telefonen
  Brukernavn
  Fullt navn
*/
