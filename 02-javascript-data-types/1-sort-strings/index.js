/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const params = {
    asc: 1,
    desc: -1
  };
  arr = [...arr];
  const collator = new Intl.Collator(['ru', "en"], {caseFirst: "upper"});
  arr.sort((i,j)=>params[param] * collator.compare(i,j));
  return [...arr];
}


