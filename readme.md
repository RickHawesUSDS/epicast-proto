# EpiCast Prototype

This is a repository for rhawes@cdc.gov to explore concepts about the EpiCast protocol.

## EpiCast aims to

A proposed technical solution to for public health programs to share case information with CDC, each other and the public.

* **Human and machine readable** - Simple enough for humans to read, structured and standardized enough that machines can acess the data.
* **Flexible** - able to handle data element changes, local and national, that occur in an new outbreak.
* **Scalable** - Support pandemic scale. From 1 to 1M data items per month.
* **Sustainable** - Standardized, open-source reference implementations, free tooling and services.
* **Secure** - Support both public and private feeds.

In broad sense, EpiCast supports the CDC's NorthStar architecture, the open data movement, and the CDC's DMI direction for NNDSS.

## Current ideas

* Publish complete data sets instead of sending individual messages.
* States are the source of truth for data set
* Use CSV because it is understood by both epidemiolgist and data scientists.
* Support for supplemental datatypes including FHIR, and HL7 messages.
* Take important ideas from TESSY including validation language and support from aggregates
* Define a schema language
* Validation done on entry by using a computable language (CQL inspired)
* Logging of events in the feed.
* Use S3 Buckets and Azure Blobs as the base protocol because all cloud vendors can support these protocols

## A demo script

The prototype should be support a demonstration of these concepts.

1. Simple case
    1. Add cases
    2. Publish is controlled by the publisher
    3. Show published folder and timeseries
    4. Receive is automatic
2. Pandemic spike
    1. Add 15000 cases
    2. Look at logs
    3. Show published folder and the higher partitioning
3. Show a schema change
    1. Reset to remove all the pandemic records
    2. Explain column colors (common, cdc, local)
    3. Add a cdc and local elements
    4. Show the schema change
    5. Show the receive table

## TODO

* [x] Demo website
* [x] State page
* [x] Publish a timeseries
* [x] Publish a log
* [x] Define bucket, schema, element, schema for StateCases
* [x] Timeseries read interface (id, at, lastModifiedAt, enumerate elements)
* [x] Schema publishing (enumerate elements), define Member interface
* [x] /statecases/schema route & read in State table
* [x] Start CDCCase (model, cdcCaseTimeSeries, cdccases route)
* [x] Define /cdccase/subscriber { lastCheckedAt: , automatic: true }
* [x] Read schema from feed (readSchema)
* [x] readTimeSeries, readCDCfeed
* [x] automatic receive
* [x] CDC page (table and refresh)
* [x] Change algorithm to only change at the first of the month or day. Elminate delete of object. Make large add start on the month.
* [x] Update state to last published
* [x] Update cdc to show when stuff is being read and last read.
* [x] Versioned buckets, publish snapshots, use snapshots consistent reads
* [x] Change schemas dialog in state. Options for new CDC data element, a new other state element and local element
* [x] Aggregates published
* [ ] Random change methods and button
* [ ] Random duplicates. Add deduplicate button. replaceBy column. replacedBy log.
* [ ] Reorganize code around domains (senders, receivers, feed, server, utils) and CUPID
* [ ] Validator service. watcher domain to validate and provide webhooks.
* [ ] Show only published elements in State table
* [ ] Show only what is CDC elements in CDC table
* [ ] Allow two people to run the demo at the same time. Locking publishers needed.
