
export function qsa(selector, element) {
  element = element || document;
  return element.querySelectorAll(selector);
}

export function getCssRules(cssRulesObject) {
  return arrayFrom(cssRulesObject).reduce(function (prev, curr) {
    return prev.concat(curr.cssRules ? getCssRules(curr.cssRules) : curr);
  }, []);
}

export function getMatches(str, regex, result) {
  result = result || [];
  var match;
  while ((match = regex.exec(str)) !== null) {
    result.push(match);
    regex.lastIndex = match.index + match[0].length;
  }
  return result;
}

export function niceArguments(fn) {
  return function (decl) {
    fn.apply(this, decl);
  };
}

export function objectResolve(obj, props) {
  return props.reduce(function (prev, curr) {
    return prev ? prev[curr] : undefined;
  }, obj);
}

export function makeCount(countMap) {
  countMap = countMap || {};
  return function count(key) {
    countMap[key] = isNaN(countMap[key]) ? 0 : countMap[key] + 1;
    return countMap[key];
  };
}

export function arrayFrom(object) {
  return [].slice.call(object);
}

export function ready(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

export function makeCache() {
  var cacheMap = {};
  return function cache(key, value) {
    if (!key) {
      return cacheMap;
    }
    if (!value) {
      return cacheMap[key];
    }
    cacheMap[key] = value;
    return value;
  };
}

export function makeKey(expando) {
  return function key() {
    return arrayFrom(arguments).reduce(function(prev, curr) {
      if (!curr) {
        return prev;
      }
      if (typeof curr === 'object') {
        return prev + uniqueId(curr, expando);
      }
      return prev + curr;
    }, '');
  };
}

var idCounter = 0;

export function uniqueId(object, expando) {
  if (object[expando]) {
    return object[expando];
  }
  var id = ++idCounter;
  object[expando] = id;
  return id;
}

export function cleanCss(css) {
  if (css) {
    return css.replace(/\s+/g, ' ').replace(/"/g, '\'').trim();
  }
  return '';
}
