# EpiCast Portal

## Introduction

Every EpiCast feed includes a portal website to provide a human readable version of the data of the data in the feed. This project creates a set of static assets that can be copied into the `/portal` folder of every feed as part of the feed publish process.

The portal is a React App that only uses the resources in the data feed. It is built to be hosted in an S3 bucket and not require a special web server or api.

## Background

EpiCast aims to be both a machine readable and a human readable format. It uses formats that like CSV and YAML that are good representations of this goal. Nevertheless, the portal improves upon the readability of these formats by providing a well designed user interface. 
