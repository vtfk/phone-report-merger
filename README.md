# Phone Report Merger
A simple script to merge reports from Techstep and Telenor and to be pushed into Cherwell.

## Usage
1. [Download](https://github.com/vtfk/phone-report-merger/releases) or [build](#Development-&-building) the latest binary for you platform.
2. Run the script once to generate directories for the reports. (Reports are Excel files (.xlsx))
3. Place Techstep reports in `./data/techstep/` and Telenor reports in `./data/telenor/`
4. Make sure the reports follow the naming scheme described [here](#naming-scheme)

## Naming scheme
These columns are required (case-sensitive), but it can include others as well (they will not be used)

### Telenor report
|Abonnementets startdato|Bruker Etternavn|Bruker Fornavn|IMEI|
|-|-|-|-|
|Date|Text|Text|Text/Number|

### Techstep report
|Produkt|imei nummer|Varenummer|Antall|Omsetning eks MVA|
|-|-|-|-|-|
|Text|Text/Number|Text|Number|Number|

## Development & building
```sh
# Clone and install dependencies
git clone https://github.com/vtfk/phone-report-merger
cd phone-report-merger
npm install

# Run TS script
npm run dev

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