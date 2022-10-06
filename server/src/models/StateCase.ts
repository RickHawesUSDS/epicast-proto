import { Table, Column, Model, PrimaryKey, UpdatedAt, CreatedAt, AutoIncrement } from 'sequelize-typescript'

@Table({ tableName: 'stateCases'})
export class StateCase extends Model<StateCase> {
    @PrimaryKey
    @AutoIncrement
    @Column
    caseId!: number;

    @CreatedAt
    @Column
    createdAt!: Date;

    @UpdatedAt
    @Column
    updatedAt!: Date;

    @Column
    personFirstName!: string;

    @Column
    personLastName!: string;

    @Column
    personDateOfBirth?: Date;

    @Column
    personRace?: string;

    @Column
    personEthnicity?: string;

    @Column
    personSexAtBirth?: string;

    @Column
    personSexualOrientation?: string;

    @Column
    personAddress?: string;

    @Column
    personCity?: string;

    @Column
    personState?: string;

    @Column
    personPostalCode?: string;

    @Column
    personPhone?: string;

    @Column
    personEmail?: string;

    @Column
    onsetOfSymptoms!: Date;

    @Column
    hospitalized?: string;

    @Column
    subjectDied?: string;
}
