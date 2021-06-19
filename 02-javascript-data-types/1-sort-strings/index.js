/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  let answer = arr.sort((item1, item2)=>item1.localeCompare(item2));
  return param === "asc" ? answer.reverse() : answer;
}

