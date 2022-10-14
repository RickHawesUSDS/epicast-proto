# EpiCast Prototype

This is private repository for rhawes@cdc.gov to explore concepts about the EpiCast protocol.

## EpiCast is...
A proposed technical solution to for public health programs to share case information with CDC, each other and the public.

* **Human and machine readable** - Simple enough for humans to read, structured and standardized enough that machines can acess the data.
* **Flexible** - able to handle data element changes, local and national, that occur in an new outbreak.
* **Scalable** - Support pandemic scale. From 1 to 1M data items per month.
* **Sustainable** - Standardized, open-source reference implementations, free tooling and services.
* **Secure** - Support both public and private data.

In broad sense, EpiCast supports the CDC's NorthStar architecture, the open data movement, and the DMI direction for NNDSS.

## Potential Demo
1. Simple case
    1. Add cases
    2. Publish
    3. Show published folder and timeseries
    4. Receive
2. Pandemic spike
    1. Add 15000 cases
    2. Look at logs
    6. Show published folder and the higher partitioning
3. Show a schema change
    1. Reset to remove all the pandemic records
    2. Explain column colors (common, cdc, local)
    3. Add a cdc and local elements
    3. Show the schema change
    3. Show the receive table

## TODO
- [x] Finish log feed
- [ ] Define table, element, case interfaces
- [ ] Finish schema publishing (enumerate elements), define Member interface
- [ ] Color code columns in interface
- [ ] Timeseries read interface (id, at, lastModifiedAt, enumerate elements)
- [ ] Timeseries demo update interface (addRandom, updateRandom, deleteRandom)
- [ ] Automatic receive


