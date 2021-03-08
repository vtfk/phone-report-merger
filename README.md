# Phone Report Merger

[![Build & Release](https://github.com/vtfk/phone-report-merger/actions/workflows/release.yml/badge.svg)](https://github.com/vtfk/phone-report-merger/actions/workflows/release.yml)

A simple script to merge reports from Techstep and Telenor and to be pushed into Cherwell.

---

## Table of contents
- [Usage](#Usage)
- [Report naming scheme](#Report-naming-scheme)
- [Development & building](#Development--building)
- [License](#LICENSE)

---

## Usage
1. [Download](https://github.com/vtfk/phone-report-merger/releases) or [build](#development--building) the latest binary for you platform.
2. Run the script once to generate directories for the reports. (Reports are Excel files (.xlsx))
3. Place Techstep reports in `./data/techstep/` and Telenor reports in `./data/telenor/`
4. Make sure the reports follow the naming scheme described [here](#naming-scheme)

---

## Report naming scheme
These columns are required (case-sensitive), but it can include others as well (they will not be used)

### Telenor report
|Abonnementets startdato|Bruker Etternavn|Bruker Fornavn|IMEI|
|-|-|-|-|
|Date|Text|Text|Text/Number|

### Techstep report
|Produkt|imei nummer|Varenummer|Antall|Omsetning eks MVA|
|-|-|-|-|-|
|Text|Text/Number|Text|Number|Number|

---

## Development & building
```sh
# Clone and install dependencies
git clone https://github.com/vtfk/phone-report-merger
cd phone-report-merger
npm install

# Run TS script
npm run dev

# Publish new version
npm version {patch,minor,major}
git push && git push --tag
# If tests complete and the build is successful; A release will be created with the binary files as assets.

# Run tsc
npm run build

# Run pkg to build the binaries
# This will build a binary for: linux, macos, windows. On your current node version and arch.
npm run build:bin
# To build for a specific NodeVer/platform/arch use the --targets option
# Read more here: https://github.com/vercel/pkg#Targets
# Examples:
npm run build:bin -- --targets linux
npm run build:bin -- --targets node14-linux-x64
```

## LICENSE
[MIT](LICENSE)
