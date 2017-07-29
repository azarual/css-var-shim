
function onCssVarMap(cssVarMap) {

  window.cssVarCache = [];
  window.cssVarSupport = window.CSS && CSS.supports && CSS.supports('--a', 0);
  //cssVarSupport = false;

  if (!cssVarSupport) {

    var originalSetProperty = CSSStyleDeclaration.prototype.setProperty;
    CSSStyleDeclaration.prototype.setProperty = function(prop, value, priority) {
      if (/^--/.test(prop)) {
        var varRegex = new RegExp('var\\(' + prop + '(,[^)]+)?\\)');
        var cssRules = getCssRules(document.styleSheets);
        cssRules.forEach(function(rule) {
          var selector = rule.selectorText;
          var varDecls = objectResolve(cssVarMap.getVars, [ prop, selector, count(selector) ]);
          if (varDecls) {
            varDecls.forEach(niceArguments(function(mapProp, mapValue, mapPriority) {
              var replacedValue = mapValue.replace(varRegex, value);
              // IE doesn't like undefined as the important argument
              rule.style.setProperty(mapProp, replacedValue, mapPriority || null);
            }));
          }
        });
        return;
      }
      originalSetProperty.call(this, prop, value, priority);
    };
  }

  function getCssRules(cssRulesObject) {
    return arrayFrom(cssRulesObject).reduce(function(prev, curr) {
      return prev.concat(curr.cssRules ? getCssRules(curr.cssRules) : curr);
    }, []);
  }

  function niceArguments(fn) {
    return function(decl) {
      fn.apply(this, decl);
    }
  }

  function objectResolve(obj, props) {
    return props.reduce(function(prev, curr) {
      return prev ? prev[curr] : undefined
    }, obj);
  }

  var count = (function makeCount(countMap) {
      countMap = countMap || {};
      return function (key) {
          countMap[key] = isNaN(countMap[key]) ? 0 : countMap[key] + 1;
          return countMap[key];
      };
  }());

  function arrayFrom(object) {
    return [].slice.call(object);
  }
}
