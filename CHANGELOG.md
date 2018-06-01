# Change Log
All notable changes to the **JSONPath Extract** extension will be documented in this file.

## [Unreleased]
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
