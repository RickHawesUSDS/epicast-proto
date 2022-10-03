import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';

const columns = [
  { id: 'caseId', label: 'Case Id', minWidth: 100},
  // { id: 'createdAt', label: 'Created At', minWidth: 100},
  { id: 'updatedAt', label: 'Updated At', minWitdh: 100},
  { id: 'personFirstName', label: 'First Name', minWidth: 120},
  { id: 'personFirstName', label: 'Last Name', minWidth: 120},
  { id: 'personDateOfBirth', label: 'Date of Birth', minWidth: 100},
  { id: 'personRace', label: 'Race', minWidth: 100},
  { id: 'personEthnicity', label: 'Ethnicity', minWidth: 100},
  { id: 'personSexAtBirth', label: 'Sex at Birth', minWidth: 100},
  { id: 'personSexualOrientation', label: 'Sexual Orientation', minWidth: 100},
  { id: 'personAddress', label: 'Address', minWidth: 170},
  { id: 'personCity', label: 'City', minWidth: 100},
  { id: 'personState', label: 'State', minWidth: 100},
  { id: 'personPostalCode', label: 'Postal Code', minWidth: 100},
  { id: 'personPhone', label: 'Telephone', minWidth: 100},
  { id: 'personEmail', label: 'Email', minWidth: 100},  
  { id: 'onsetOfSymptoms', label: 'Onset of Symptoms', minWidth: 100},
  { id: 'hospitalized', label: 'Hospitalized', minWidth: 100},  
  { id: 'subjectDied', label: 'Subject Died', minWidth: 100},
];

function fetchCases() {
  const rows = 
  [
    {
      "caseId": 1,
      "createdAt": "2022-10-03T14:57:34.746Z",
      "updatedAt": "2022-10-03T14:57:34.746Z",
      "personFirstName": "Katherine",
      "personLastName": "Miller",
      "personDateOfBirth": "1975-04-03T10:08:45.657Z",
      "personRace": null,
      "personEthnicity": null,
      "personSexAtBirth": null,
      "personSexualOrientation": null,
      "personAddress": "331 Schumm Mall",
      "personCity": "Jonesfurt",
      "personState": "CA",
      "personPostalCode": "29295-1597",
      "personPhone": "(228) 641-1546 x58361",
      "personEmail": "Crystel_Frami15@gmail.com",
      "onsetOfSymptoms": "2022-10-03T14:57:34.744Z",
      "hospitalized": "N",
      "subjectDied": "N"
    },
    {
      "caseId": 2,
      "createdAt": "2022-10-03T14:57:34.750Z",
      "updatedAt": "2022-10-03T14:57:34.750Z",
      "personFirstName": "Mafalda",
      "personLastName": "Rau",
      "personDateOfBirth": "1935-06-17T16:04:48.317Z",
      "personRace": null,
      "personEthnicity": null,
      "personSexAtBirth": null,
      "personSexualOrientation": null,
      "personAddress": "57659 Ernser Estate",
      "personCity": "Bodestead",
      "personState": "CA",
      "personPostalCode": "41220-0539",
      "personPhone": "1-657-234-9097 x4054",
      "personEmail": "Tommie.Schowalter@yahoo.com",
      "onsetOfSymptoms": "2022-10-03T14:57:34.744Z",
      "hospitalized": "N",
      "subjectDied": "N"
    },
    {
      "caseId": 3,
      "createdAt": "2022-10-03T14:57:34.752Z",
      "updatedAt": "2022-10-03T14:57:34.752Z",
      "personFirstName": "Norma",
      "personLastName": "Kessler",
      "personDateOfBirth": "1971-12-13T20:32:13.053Z",
      "personRace": null,
      "personEthnicity": null,
      "personSexAtBirth": null,
      "personSexualOrientation": null,
      "personAddress": "80733 Verner Vista",
      "personCity": "Port Kennafurt",
      "personState": "CA",
      "personPostalCode": "14997",
      "personPhone": "327-803-5484 x86001",
      "personEmail": "Abel.Kihn@gmail.com",
      "onsetOfSymptoms": "2022-10-03T14:57:34.744Z",
      "hospitalized": "N",
      "subjectDied": "N"
    },
    {
      "caseId": 4,
      "createdAt": "2022-10-03T14:57:34.754Z",
      "updatedAt": "2022-10-03T14:57:34.754Z",
      "personFirstName": "Armani",
      "personLastName": "Rempel",
      "personDateOfBirth": "1958-08-06T19:40:38.010Z",
      "personRace": null,
      "personEthnicity": null,
      "personSexAtBirth": null,
      "personSexualOrientation": null,
      "personAddress": "4016 Dovie Canyon",
      "personCity": "Binghamton",
      "personState": "CA",
      "personPostalCode": "93648-7126",
      "personPhone": "917-784-5857 x73214",
      "personEmail": "Elise96@hotmail.com",
      "onsetOfSymptoms": "2022-10-03T14:57:34.744Z",
      "hospitalized": "N",
      "subjectDied": "N"
    },
    {
      "caseId": 5,
      "createdAt": "2022-10-03T14:57:34.755Z",
      "updatedAt": "2022-10-03T14:57:34.755Z",
      "personFirstName": "Cara",
      "personLastName": "Bins",
      "personDateOfBirth": "1968-05-05T02:45:22.579Z",
      "personRace": null,
      "personEthnicity": null,
      "personSexAtBirth": null,
      "personSexualOrientation": null,
      "personAddress": "749 Lori Stream",
      "personCity": "West Hobartshire",
      "personState": "CA",
      "personPostalCode": "23090",
      "personPhone": "1-742-874-4251",
      "personEmail": "Jaida_Mills25@hotmail.com",
      "onsetOfSymptoms": "2022-10-03T14:57:34.744Z",
      "hospitalized": "N",
      "subjectDied": "N"
    },
    {
      "caseId": 6,
      "createdAt": "2022-10-03T14:57:34.757Z",
      "updatedAt": "2022-10-03T14:57:34.757Z",
      "personFirstName": "Barbara",
      "personLastName": "Maggio",
      "personDateOfBirth": "2014-11-07T04:27:30.149Z",
      "personRace": null,
      "personEthnicity": null,
      "personSexAtBirth": null,
      "personSexualOrientation": null,
      "personAddress": "185 Leffler Stravenue",
      "personCity": "Port Misaelmouth",
      "personState": "CA",
      "personPostalCode": "62477-7776",
      "personPhone": "777.553.7859",
      "personEmail": "Lonie.Steuber@hotmail.com",
      "onsetOfSymptoms": "2022-10-03T14:57:34.744Z",
      "hospitalized": "N",
      "subjectDied": "N"
    },
    {
      "caseId": 7,
      "createdAt": "2022-10-03T14:57:34.758Z",
      "updatedAt": "2022-10-03T14:57:34.758Z",
      "personFirstName": "Fabiola",
      "personLastName": "Altenwerth",
      "personDateOfBirth": "1987-05-29T02:22:25.326Z",
      "personRace": null,
      "personEthnicity": null,
      "personSexAtBirth": null,
      "personSexualOrientation": null,
      "personAddress": "00170 Roberts Park",
      "personCity": "Hughview",
      "personState": "CA",
      "personPostalCode": "23744-1786",
      "personPhone": "272-322-4404",
      "personEmail": "Lillian_Schaden@gmail.com",
      "onsetOfSymptoms": "2022-10-03T14:57:34.744Z",
      "hospitalized": "N",
      "subjectDied": "N"
    },
    {
      "caseId": 8,
      "createdAt": "2022-10-03T14:57:34.760Z",
      "updatedAt": "2022-10-03T14:57:34.760Z",
      "personFirstName": "Edgar",
      "personLastName": "Dibbert",
      "personDateOfBirth": "2006-03-14T01:18:09.909Z",
      "personRace": null,
      "personEthnicity": null,
      "personSexAtBirth": null,
      "personSexualOrientation": null,
      "personAddress": "48785 Koss Motorway",
      "personCity": "Kemmercester",
      "personState": "CA",
      "personPostalCode": "47663",
      "personPhone": "918.461.1163",
      "personEmail": "Lula_Lemke56@gmail.com",
      "onsetOfSymptoms": "2022-10-03T14:57:34.744Z",
      "hospitalized": "N",
      "subjectDied": "N"
    },
    {
      "caseId": 9,
      "createdAt": "2022-10-03T14:57:34.761Z",
      "updatedAt": "2022-10-03T14:57:34.761Z",
      "personFirstName": "Edmund",
      "personLastName": "Hintz",
      "personDateOfBirth": "1990-03-07T10:33:13.307Z",
      "personRace": null,
      "personEthnicity": null,
      "personSexAtBirth": null,
      "personSexualOrientation": null,
      "personAddress": "7063 Deion Oval",
      "personCity": "Kimberlyside",
      "personState": "CA",
      "personPostalCode": "79751",
      "personPhone": "(527) 368-0983 x0569",
      "personEmail": "Cecilia.Toy52@gmail.com",
      "onsetOfSymptoms": "2022-10-03T14:57:34.744Z",
      "hospitalized": "N",
      "subjectDied": "N"
    },
    {
      "caseId": 10,
      "createdAt": "2022-10-03T14:57:34.762Z",
      "updatedAt": "2022-10-03T14:57:34.762Z",
      "personFirstName": "Simeon",
      "personLastName": "Dicki",
      "personDateOfBirth": "1966-06-29T16:32:24.914Z",
      "personRace": null,
      "personEthnicity": null,
      "personSexAtBirth": null,
      "personSexualOrientation": null,
      "personAddress": "223 Haag Plaza",
      "personCity": "Waipahu",
      "personState": "CA",
      "personPostalCode": "54715-4987",
      "personPhone": "(889) 888-1096",
      "personEmail": "Christop.Bernier@gmail.com",
      "onsetOfSymptoms": "2022-10-03T14:57:34.744Z",
      "hospitalized": "N",
      "subjectDied": "N"
    },
    {
      "caseId": 11,
      "createdAt": "2022-10-03T14:57:34.763Z",
      "updatedAt": "2022-10-03T14:57:34.763Z",
      "personFirstName": "Cristina",
      "personLastName": "Nitzsche",
      "personDateOfBirth": "2010-12-11T21:43:41.274Z",
      "personRace": null,
      "personEthnicity": null,
      "personSexAtBirth": null,
      "personSexualOrientation": null,
      "personAddress": "984 Ebert Avenue",
      "personCity": "Bernhardtown",
      "personState": "CA",
      "personPostalCode": "61433-2582",
      "personPhone": "(672) 781-1830",
      "personEmail": "Joy.Ruecker@hotmail.com",
      "onsetOfSymptoms": "2022-10-03T14:57:34.744Z",
      "hospitalized": "N",
      "subjectDied": "N"
    },
    {
      "caseId": 12,
      "createdAt": "2022-10-03T14:57:34.764Z",
      "updatedAt": "2022-10-03T14:57:34.764Z",
      "personFirstName": "Rosalyn",
      "personLastName": "Hettinger",
      "personDateOfBirth": "1957-02-23T20:01:00.511Z",
      "personRace": null,
      "personEthnicity": null,
      "personSexAtBirth": null,
      "personSexualOrientation": null,
      "personAddress": "20694 Ebert Ramp",
      "personCity": "Talialand",
      "personState": "CA",
      "personPostalCode": "20915",
      "personPhone": "213-830-2065",
      "personEmail": "Albert.Lindgren@gmail.com",
      "onsetOfSymptoms": "2022-10-03T14:57:34.744Z",
      "hospitalized": "N",
      "subjectDied": "N"
    },
    {
      "caseId": 13,
      "createdAt": "2022-10-03T14:57:34.765Z",
      "updatedAt": "2022-10-03T14:57:34.765Z",
      "personFirstName": "Newton",
      "personLastName": "Weber",
      "personDateOfBirth": "1989-10-19T10:04:13.547Z",
      "personRace": null,
      "personEthnicity": null,
      "personSexAtBirth": null,
      "personSexualOrientation": null,
      "personAddress": "903 Monica Avenue",
      "personCity": "Toybury",
      "personState": "CA",
      "personPostalCode": "08282",
      "personPhone": "549-576-6549 x9406",
      "personEmail": "Willow.Jakubowski91@yahoo.com",
      "onsetOfSymptoms": "2022-10-03T14:57:34.744Z",
      "hospitalized": "N",
      "subjectDied": "N"
    }
  ]
  return rows
}

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
  container: {
    maxHeight: 440,
  },
});

export default function CaseTable() {
  const classes = useStyles();
  const rows = fetchCases()
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <div style={{ paddingLeft: 30, paddingRight: 30}}>
      <TableContainer className={classes.container}>
        <Table size="small" stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {column.format && typeof value === 'number' ? column.format(value) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );
}
