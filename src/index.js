import { qsa, getCssRules, getSheetsByName, getMatches, niceArguments, objectResolve, makeCount, arrayFrom, ready, makeCache, makeKey, cleanCss } from './utils';

function cssVarShim(cssVarMap, cssFileName) {
  var cssVarSupport = window.CSS && CSS.supports && CSS.supports('--a', 0);
  if (cssVarSupport) {
    return;
  }

  var key = makeKey('wl__uuid');
  var cache = makeCache();

  function init() {
    // Sets all the css vars that are defined in the stylesheet.
    cssVarMap.setVars.forEach(niceArguments(setVar));

    ready(function () {
      // Set all defined inline css vars, using data-style attribute.
      var varElements = qsa('[data-style*="--"]');
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

  var originalGetPropertyValue = CSSStyleDeclaration.prototype.getPropertyValue;
  CSSStyleDeclaration.prototype.getPropertyValue = function (prop, element) {
    if (/^--/.test(prop)) {
      return getVarValue(prop, element);
    }
    return originalGetPropertyValue.call(this, prop);
  };

  var originalSetProperty = CSSStyleDeclaration.prototype.setProperty;
  CSSStyleDeclaration.prototype.setProperty = function (prop, value, priority, element) {
    if (/^--/.test(prop)) {
      cache(key(prop, element), value);

      var count = makeCount();
      var cssRules = getCssRules(getSheetsByName(document.styleSheets, cssFileName));
      cssRules.forEach(function (rule) {
        var selector = cleanCss(rule.selectorText);
        var selectorCount = count(selector);
        var varDecls = objectResolve(cssVarMap.getVars, [prop, selector, selectorCount]);
        if (!varDecls) {
          // IE11 reverses multiple classes in the selectors
          var multipleClassMatches = getMatches(selector, /\.[\w-]+(\.[\w-]+)+/g);
          if (multipleClassMatches.length) {
            multipleClassMatches.forEach(function (mcMatch) {
              var mc = mcMatch[0];
              var cm = '.' + mc.slice(1).split('.').reverse().join('.');
              selector = selector.replace(mc, cm);
            });
            varDecls = objectResolve(cssVarMap.getVars, [prop, selector, selectorCount]);
          }
        }
        if (varDecls) {
          varDecls.forEach(niceArguments(function (mapProp, mapValue, mapPriority) {
            var replacedValue = replaceVarsInValue(mapValue, element);
            if (element) {
              arrayFrom(qsa(selector)).forEach(function (node) {
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

  function replaceVarsInValue(value, element) {
    var matchGetVar = /--[^\s,)]+/g;
    var getVarMatches = getMatches(value, matchGetVar);
    if (getVarMatches.length) {
      getVarMatches.forEach(function (getVarMatch) {
        var getVar = getVarMatch[0];
        var varValue = getVarValue(getVar, element);
        if (varValue) {
          var varRegex = new RegExp('var\\(' + getVar + '(,[^)]+)?\\)');
          value = value.replace(varRegex, varValue);
          value = replaceVarsInValue(value, element);
        }
      });
    }
    return value;
  }

  function getVarValue(prop, element) {
    var propValue = cache(key(prop, element));
    // Go up the tree until a prop value is found
    while (!propValue && element && element.parentElement) {
      element = element.parentElement;
      propValue = cache(key(prop, element));
    }
    return propValue;
  }

  function setVar(prop, value, important, selector) {
    var elements = [ document.documentElement ];
    if (!selector || selector !== ':root') {
      elements = qsa(selector);
    }
    arrayFrom(elements).forEach(function (element) {
      var target = element !== document.documentElement ? element : null;
      element.style.setProperty(prop, value, important || null, target);
    });
  }

  init();
}

export default cssVarShim;
