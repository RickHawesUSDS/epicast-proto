import { Table, Column, Model, PrimaryKey, UpdatedAt, CreatedAt, AutoIncrement, Index } from 'sequelize-typescript'

@Table({ tableName: 'stateCases' })
export class StateCase extends Model<StateCase> {
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
    personFirstName!: string

  @Column
    personLastName!: string

  @Column
    personDateOfBirth?: Date

  @Column
    personRace?: string

  @Column
    personEthnicity?: string

  @Column
    personSexAtBirth?: string

  @Column
    personSexualOrientation?: string

  @Column
    personAddress?: string

  @Column
    personCity?: string

  @Column
    personState?: string

  @Column
    personPostalCode?: string

  @Column
    personPhone?: string

  @Column
    personEmail?: string

  @Column
    onsetOfSymptoms!: Date

  @Column
    hospitalized?: string

  @Column
    subjectDied?: string

  @Column
    localQuestion1?: string

  @Column
    localQuestion2?: string

  @Column
    localQuestion3?: string

  @Column
    cdcQuestion1?: string

  @Column
    cdcQuestion2?: string

  @Column
    cdcQuestion3?: string

  @Column
    neighborQuestion1?: string

  @Column
    neighborQuestion2?: string

  @Column
    neighborQuestion3?: string
}
