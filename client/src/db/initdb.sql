create table covid_cases
(
    case_id            serial
        primary key,
    updated            timestamp,
    created            timestamp,
    person_family_name integer,
    person_surname     integer,
    person_telephone   integer,
    person_address     integer,
    person_city        integer,
    person_state       integer,
    person_zipcode     integer,
    person_birthdate   date,
    person_demo_gender integer not null,
    onset_of_symptoms  date
);