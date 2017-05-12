module.exports = function (array, key) {
  
  var newArray = array.map(function(element) {
    var diff = Math.abs(element.guess - key)
    return {
      userId: element.userId,
      username: element.username,
      guess: element.guess,
      auth: element.auth,
      diff: diff
    }
  })

  newArray.sort(function(a,b) {
    return a.diff - b.diff
  })
  console.log(newArray)

  return newArray[0]
   
}