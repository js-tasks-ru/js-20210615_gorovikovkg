/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  // То для чего я спрашивал про eval

    return (obj)=>eval("try{obj." + path + "}catch (e){}");
//    Вот решение без eval

//  const keys = path.split(".");
//  return function(obj){
//    for (let i of keys){
//      if (i in obj) obj = obj[i];
//      else return;
//    }
//    return obj;
//  }
//
}
