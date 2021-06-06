/**
 * @function format
 * @param {Array<Object>} results
 * @returns {String}
 * 
 */
module.exports = (results, current)=>{
    return "```"+results.map((e, i)=>{let c = ""; if(current==e)c=">>> "; return `${c} ${i+1}. ${e.title} | ${e.length.simpleText}`}).join("\n\n") + "```"
}