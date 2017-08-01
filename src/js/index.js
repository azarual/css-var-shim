
window.cssVarCache = {};

function onCssVarMap(cssVarMap) {
  // var cssVarSupport = window.CSS && CSS.supports && CSS.supports('--a', 0);
  // if (cssVarSupport) {
  //   return;
  // }

  function init() {
    // Sets all the css vars that are defined in the stylesheet.
    cssVarMap.setVars.forEach(niceArguments(setVar));

    ready(function (event) {
      // Set all defined inline css vars, using data-style attribute.
      var varElements = document.querySelectorAll('[data-style*="--"]');
      arrayFrom(varElements).forEach(function (varElement) {
        var dataStyle = varElement.getAttribute('data-style');
        var matchVar = /(--[^:]+)\s*:\s*([^;]+)/g;
        var varMatches = getMatches(dataStyle, matchVar);
        if (varMatches.length) {
          varMatches.forEach(niceArguments(function (match, prop, value) {
            // To target a specific element a fourth element argument is added
            // to the `style.setProperty` method. There is no other way to
            // retrieve the element in the overriden method.
            varElement.style.setProperty(prop, value, null, varElement);
          }));
        }
      });
    });
  }

  var originalSetProperty = CSSStyleDeclaration.prototype.setProperty;
  CSSStyleDeclaration.prototype.setProperty = function (prop, value, priority, element) {
    if (/^--/.test(prop)) {
      cssVarCache[prop] = value;
      var count = makeCount();
      var cssRules = getCssRules(document.styleSheets);
      cssRules.forEach(function (rule) {
        var selector = rule.selectorText;
        var varDecls = objectResolve(cssVarMap.getVars, [prop, selector, count(selector)]);
        if (varDecls) {
          varDecls.forEach(niceArguments(function (mapProp, mapValue, mapPriority) {
            var replacedValue = replaceVarsInValue(mapValue, cssVarCache);
            if (element) {
              arrayFrom(document.querySelectorAll(selector)).forEach(function (node) {
                if (element.contains(node)) {
                  // IE doesn't like undefined as the important argument
                  node.style.setProperty(mapProp, replacedValue, mapPriority || null);
                }
              });
            } else {
              // IE doesn't like undefined as the important argument
              rule.style.setProperty(mapProp, replacedValue, mapPriority || null);
            }
          }));
        }
      });
      return;
    }
    originalSetProperty.call(this, prop, value, priority);
  };

  function replaceVarsInValue(value, map) {
    var matchGetVar = /--[^\s,)]+/g;
    var getVarMatches = getMatches(value, matchGetVar);
    if (getVarMatches.length) {
      getVarMatches.forEach(function (getVarMatch) {
        var getVar = getVarMatch[0];
        var getVarValue = objectResolve(map, [getVar]);
        if (getVarValue) {
          var varRegex = new RegExp('var\\(' + getVar + '(,[^)]+)?\\)');
          value = value.replace(varRegex, getVarValue);
          value = replaceVarsInValue(value, map);
        }
      });
    }
    return value;
  }

  function setVar(prop, value, important, selector, selectorIndex) {
    var elements = [ document.documentElement ];
    if (!selector || selector !== ':root') {
      elements = document.querySelectorAll(selector);
    }
    arrayFrom(elements).forEach(function (element) {
      element.style.setProperty(prop, value, important || null);
    });
  }

  function getCssRules(cssRulesObject) {
    return arrayFrom(cssRulesObject).reduce(function (prev, curr) {
      return prev.concat(curr.cssRules ? getCssRules(curr.cssRules) : curr);
    }, []);
  }

  function getMatches(str, regex, result) {
    result = result || [];
    var match;
    while ((match = regex.exec(str)) !== null) {
      result.push(match);
      regex.lastIndex = match.index + match[0].length;
    }
    return result;
  }

  function niceArguments(fn) {
    return function (decl) {
      fn.apply(this, decl);
    }
  }

  function objectResolve(obj, props) {
    return props.reduce(function (prev, curr) {
      return prev ? prev[curr] : undefined
    }, obj);
  }

  function makeCount(countMap) {
      countMap = countMap || {};
      return function (key) {
          countMap[key] = isNaN(countMap[key]) ? 0 : countMap[key] + 1;
          return countMap[key];
      };
  };

  function arrayFrom(object) {
    return [].slice.call(object);
  }

  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  init();
}
