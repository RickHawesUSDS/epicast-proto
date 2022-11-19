import { Table, Column, Model, PrimaryKey, UpdatedAt, CreatedAt, Index } from 'sequelize-typescript'

@Table({ tableName: 'cdcCases' })
export class CDCCase extends Model<CDCCase> {
  @PrimaryKey
  @Column
    caseId!: number

  @Index
  @Column
    caseDate!: Date

  @CreatedAt
  @Column
    createdAt!: Date

  @UpdatedAt
  @Index
  @Column
    updatedAt!: Date

  @Column
    personDateOfBirth?: Date

  @Column
    personRace?: string

  @Column
    personEthnicity?: string

  @Column
    personSexAtBirth?: string

  @Column
    personState?: string

  @Column
    personPostalCode?: string

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
