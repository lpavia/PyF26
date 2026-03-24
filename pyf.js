class pyf {
  constructor(maxDigitos) {
    this.secretNumber = "";
    this.maxDigitos = maxDigitos;

    //Primer dígito aleatorio
    var randomDigit = Math.floor(Math.random() * 10);
    this.secretNumber = randomDigit.toString();

    do {
      //Adicionar dígitos aleatorios mientras se cumpla longitud maxDigitos
      do {
        //Adicionar dígitos mientras no se repitan en el número secreto
        randomDigit = Math.floor(Math.random() * 10);
      } while (this.secretNumber.indexOf(randomDigit.toString()) != -1);
      this.secretNumber = this.secretNumber + randomDigit.toString();
    } while (this.secretNumber.length < maxDigitos);
  }

  checkNumber(value) {
    var digitToCheck = "";
    var posDigitToCheck = 0;
    var result = "";
    for (var index = 0; index <= value.length - 1; index++) {
      //Digito a verificar
      digitToCheck = value.toString().substr(index, 1);
      //Posición en número secreto del dígito a verificar
      posDigitToCheck = this.secretNumber.indexOf(digitToCheck);

      if (posDigitToCheck >= 0) {
        if (index == posDigitToCheck) {
          //Si se encuentra el dígito en el número secreto en la misma posición
          result = "F" + result;
        } else {
          //Si se encuentra el dígito en el número secreto en otra posición
          result = result + ".";
        }
      }
    }
    return result;
  }

  getSecretNumber() {
    return this.secretNumber;
  }

  validInput(value) {
    var digitToCheck = "";
    //Verificar Longitud
    if (value.length != this.maxDigitos) {
      return false;
    }

    //Verificar que no hay digitos repetidos

    for (var index = 0; index <= value.length - 1; index++) {
      //Digito a verificar
      digitToCheck = value.toString().substr(index, 1);
      if (value.indexOf(digitToCheck) != value.lastIndexOf(digitToCheck)) {
        return false;
      }
    }
    return true;
  }
}
