import { TimeSeriesEvent } from '@/epicast/TimeSeries'
import { Table, Column, Model, PrimaryKey, Index } from 'sequelize-typescript'

@Table({ tableName: 'cdcCases' })
export class CDCCase extends Model<CDCCase> implements TimeSeriesEvent<CDCCase> {
  @PrimaryKey
  @Column
    eventId!: string

  @Index
  @Column
    eventAt!: Date

  @Index
  @Column
    eventUpdatedAt!: Date

  @Column
    uscdiPatientDateOfBirth?: Date

  @Column
    uscdiPatientRace?: string

  @Column
    uscdiPatientEthnicity?: string

  @Column
    uscdiPatientSexAtBirth?: string

  @Column
    uscdiPatientState?: string

  @Column
    uscdiPatientPostalCode?: string

  @Column
    cdcOnsetOfSymptoms!: Date

  @Column
    cdcHospitalized?: string

  @Column
    cdcSubjectDied?: string

  @Column
    us_caQuestion1?: string

  @Column
    us_caQuestion2?: string

  @Column
    us_caQuestion3?: string

  @Column
    cdcQuestion1?: string

  @Column
    cdcQuestion2?: string

  @Column
    cdcQuestion3?: string

  @Column
    us_azQuestion1?: string

  @Column
    us_azQuestion2?: string

  @Column
    us_azQuestion3?: string

  get eventIsDeleted (): boolean | undefined {
    return
  }

  get eventReplacedBy (): string | undefined {
    return 
  }

  get model (): CDCCase {
    return this
  }

  getValue (name: string): any {
    return this[name as keyof CDCCase]
  }
}
