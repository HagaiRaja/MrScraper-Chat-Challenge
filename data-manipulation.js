function filterData(data, key, condition, value) {
    return data.filter(item => {
        if (!item.hasOwnProperty(key)) return false;
        const fieldValue = item[key].toString();
        
        switch (condition) {
        case 'equals':
            return fieldValue === value;
        case 'contains':
            return fieldValue.includes(value);
        case 'beginsWith':
            return fieldValue.startsWith(value);
        case 'endsWith':
            return fieldValue.endsWith(value);
        default:
            throw new Error('Invalid condition. Use "equals", "contains", "beginsWith", or "endsWith".');
        }
    });
}

// // Example usage:
// const breeders = [
// {
//     "Breeders Name": "4J CATTLE COMPANY",
//     "Phone": "701-833-7530\n701-833-7530",
//     "Location": "GLENBURN ND"
// },
// {
//     "Breeders Name": "4UP HEREFORDS",
//     "Phone": "701-590-1560",
//     "Location": "GRASSY BUTTE ND"
// }
// ];

// console.log(filterData(breeders, "Location", "contains", "BURN")); // Filters locations containing "ND"
  
module.exports = { filterData };
