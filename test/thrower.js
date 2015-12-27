class Thrower {
  alert() {
    throw Error('Hey, this crashed!');
  }
}

var thrower = new Thrower();
thrower.alert();
