import { Table, Column, Model, PrimaryKey, UpdatedAt, CreatedAt } from 'sequelize-typescript'

@Table
export class StateCase extends Model<StateCase> {
    @PrimaryKey
    @Column
    caseId!: number;

    @CreatedAt
    @Column
    createdAt!: Date;

    @UpdatedAt
    @Column
    updatedAt!: Date;

    @Column
    personFamilyName!: string;

    @Column
    personGivenName!: string;

    @Column
    onsetOfSymptoms!: Date;
}