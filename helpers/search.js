module.exports = function (array, key) {
  var newArray = array
  var lo = 0,
      hi = array.length - 1,
      mid,
      element,
      smallestDiff = null,
      closestUser = null

  while(newArray[lo].guess <= newArray[hi].guess) {        
    mid = Math.floor((lo + hi) / 2)
    element = newArray[mid]
    if (element.guess < key) {
        lo = mid + 1
    } else if (element.guess > key) {
        hi = mid - 1
    } else {
        return mid
    }
    var dif = Math.abs(element.guess - key)
    
    if((dif < smallestDiff) || (smallestDiff === null)) {
      smallestDiff = dif
      closestUser = newArray[mid]
      return closestUser
    }
  }
   
  return closestUser
}