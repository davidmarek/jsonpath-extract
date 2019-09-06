# Change Log
All notable changes to the **JSONPath Extraction** extension will be documented in this file.

## [1.2.0]
### Added
- Upgraded dependencies

## [1.1.0]
### Added
- Upgraded dependencies

## [1.0.0]
### Added
- Support for getting all keys from object by using ".*~"

## [0.4.0] - 2019-02-13
### Changed
- Lowered supported engine version to 1.21.0

## [0.3.0] - 2018-06-03
### Added
- New command **JPE: Run saved jsonpath query**, that runs jsonpath query predefined in configuration.
- Configuration `jsonPathExtract.savedQueries` to define often used queries.
- Explanation for **JPE: Run saved jsonpath query** to README.
- New gif to README explaining all three commands.

## [0.2.2] - 2018-06-02
### Added
- New logo

### Changed
- Merged and modified error message for no active editor and invalid json

## [0.2.1] - 2018-06-02
### Fixed
- Moved forgotten items from Unreleased to 0.2.0 in changelog

## [0.2.0] - 2018-06-02
### Added
- Integration tests
- Travis CI integration

### Changed 
- Commands renamed to `jsonPathExtract.queryToPlainText` and `jsonPathExtract.queryToJson`

### Fixed
- Proper error handling for files that can be parsed as json, but can't be used for jsonpath (e.g. string or number)

## [0.1.0] - 2018-05-28
### Added
- Initial release, supports extracting data either to a text file or a json array.
