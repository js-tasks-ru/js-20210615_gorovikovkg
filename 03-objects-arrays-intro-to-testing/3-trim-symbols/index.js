/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size=Infinity) {
    let result = "";
    let lastSymbol = "";
    let repeats = 0;
    for (let i of string){
      if (i === lastSymbol) repeats++;
      else repeats = 1;
      lastSymbol = i;
      if (repeats > size) continue;
      result+=i;
    }
    return result;
}
