import { TimeSeriesEvent } from '@/epicast/TimeSeries'
import { Table, Column, Model, PrimaryKey, UpdatedAt, CreatedAt, AutoIncrement, Index } from 'sequelize-typescript'

@Table({ tableName: 'stateCases' })
export class StateCase extends Model<StateCase> implements TimeSeriesEvent<StateCase> {
  @PrimaryKey
  @AutoIncrement
  @Column
    caseId!: number

  @Index
  @Column
    caseDate!: Date

  @CreatedAt
  @Column
    createdAt!: Date

  @Index
  @UpdatedAt
  @Column
    updatedAt!: Date

  @Column
    isDeleted?: boolean

  @Column
    replacedBy?: number

  @Column
    uscdiPatientFirstName!: string

  @Column
    uscdiPatientLastName!: string

  @Column
    uscdiPatientDateOfBirth?: Date

  @Column
    uscdiPatientRace?: string

  @Column
    uscdiPatientEthnicity?: string

  @Column
    uscdiPatientSexAtBirth?: string

  @Column
    uscdiPatientSexualOrientation?: string

  @Column
    uscdiPatientAddress?: string

  @Column
    uscdiPatientCity?: string

  @Column
    uscdiPatientState?: string

  @Column
    uscdiPatientPostalCode?: string

  @Column
    uscdiPatientPhone?: string

  @Column
    uscdiPatientEmail?: string

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

  get eventAt (): Date {
    return this.caseDate
  }

  get eventId (): string {
    return this.caseId.toString()
  }

  get eventUpdatedAt (): Date {
    return this.updatedAt
  }

  get eventIsDeleted (): boolean | undefined {
    return this.isDeleted
  }

  get eventReplacedBy (): string | undefined {
    return this.replacedBy?.toString()
  }

  get model (): StateCase {
    return this
  }

  getValue (name: string): any {
    return this[name as keyof StateCase]
  }
}
