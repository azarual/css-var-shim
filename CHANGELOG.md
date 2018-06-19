# Change Log
This project adheres to [Semantic Versioning](http://semver.org/).

## 0.2.5 - 2018-06-18
### Changed
- Defer processing after ready event
- Evaluate value from the context of the element that gets the style, rather from the context of the element that sets the variable

## 0.2.4 - 2017-08-30
### Added
- Added stylesheet filter by css file name

## 0.2.3 - 2017-08-30
### Added
- Added extra lookup with reversed multiple classes selector 

## 0.2.2 - 2017-08-14
### Added
- Added empty string check

## 0.2.1 - 2017-08-14
### Added
- Added `cleanCss` method handling quotes in selectors

## 0.2.0 - 2017-07-16
### Added
- Added support for `element.style.getPropertyValue()`

## 0.1.0 - 2017-08-05
### Removed
- Removed postcss-var-map dependency.
- Removed example and moved to the postcss plugin.

## 0.0.1 - 2017-07-16
### Added
- Basic functionality to set custom css properties at runtime.
