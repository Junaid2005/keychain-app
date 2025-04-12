export function isJSON(str: string): boolean | any {
    try {
        const startIndex = str.indexOf('{');
        const endIndex = str.lastIndexOf('}');
        
        const slicedString = str.slice(startIndex, endIndex + 1);
        const json = JSON.parse(slicedString);
        return json;
    } catch (e) {
      return false;
    }
}
  