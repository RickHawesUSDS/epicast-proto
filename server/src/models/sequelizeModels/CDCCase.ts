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
}
