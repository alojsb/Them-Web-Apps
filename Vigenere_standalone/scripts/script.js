// variables (catch relevant elements)
let encryptionCode = document.getElementById('encryptionCode');
let infoButton = document.getElementById('infoButton');
let originalText = document.getElementById('originalText');
let cryptedText = document.getElementById('cryptedText');
let encode = document.getElementById('encode');
let decode = document.getElementById('decode');
let clear = document.getElementById('clear');

// next two event listeners/functions handle the info pop-up window
infoButton.addEventListener('mouseover', function () {
  document.getElementById('info').classList.remove('hidden');
});

infoButton.addEventListener('mouseout', function () {
  document.getElementById('info').classList.add('hidden');
});

// check code word input for validity in real time
encryptionCode.addEventListener('keyup', function () {
  // delete all letters in crypted text area if original text area or code input area is empty
  if (encryptionCode.value.length == 0 || originalText.value.length == 0) {
    cryptedText.value = '';
  }

  // check if the user enters char other than letter
  checkIfAllLettersInString(encryptionCode.value);

  // check if the input string exceeds 20 letters
  if (encryptionCode.value.length > 20) {
    deleteLastChar();
  }
});

// event listener function on the "encode" button
encode.addEventListener('click', function () {
  cryptedText.value = vigenere(
    originalText.value,
    cryptedText.value,
    encryptionCode.value
  );
});

// reverse the effect from the encode function
decode.addEventListener('click', function () {
  // "invert" code word to decode text
  let newCode = inverseVigenereCode(encryptionCode.value);

  cryptedText.value = vigenere(originalText.value, cryptedText.value, newCode);
});

// event listener function on the "Clear" button
clear.addEventListener('click', function () {
  originalText.value = '';
  cryptedText.value = '';
  encryptionCode.value = '';
});

/*

  crucial part - code word is "inverted" letter by letter
  what's meant here by "inversion"?
  every letter in the initial code word is read,
  it's index in the alphabet mirror-flipped and the new letter is added to a new code word

  */
function inverseVigenereCode(str) {
  let temp = '';

  for (let i = 0; i < str.length; i++) {
    if (isUppercase(str[i])) {
      //  'A' is the only UC letter whose inversion letter is the same as itself
      if (str[i] == 'A') {
        temp += str[i];
      } else {
        temp += String.fromCharCode(26 - (str[i].charCodeAt(0) - 65) + 65);
      }
    } else {
      //  'a' is the only LC letter whose inversion letter is the same as itself
      if (str[i] == 'a') {
        temp += str[i];
      } else {
        temp += String.fromCharCode(26 - (str[i].charCodeAt(0) - 97) + 97);
      }
    }
  }

  return temp;
}

// the actual vigenere letter shift function
function vigenere(origStr, encryptedStr, keyword) {
  let lengthOfKeyword = keyword.length;

  // in case the keyword is not entered, do nothing
  if (keyword.length != 0) {
    // clear the previously created encrypted text
    encryptedStr = '';

    // store index of keyword to be able to control looping through same
    let keywordIndex = 0;

    // for the length of original text, shift every letter according to keyword
    for (let i = 0; i < origStr.length; i++) {
      // only shift letters, spaces and punctuation stay the same
      if (isLetter(origStr[i])) {
        // if it reaches end of the keyword, go back to index = 0
        if (keywordIndex == lengthOfKeyword) {
          keywordIndex = 0;
        }

        // shift the letter by letter-inside-key number of places
        encryptedStr += shift(origStr[i], keyword[keywordIndex]);
        keywordIndex++;
      } else {
        encryptedStr += origStr[i];
      }
    }
  }

  return encryptedStr;
}

// check the code word for non-letters and delete them
function checkIfAllLettersInString(textToCheck) {
  for (let i = 0; i < textToCheck.length; i++) {
    let c = isLetter(textToCheck[i]);

    if (c == false) {
      encryptionCode.value = deleteChar(textToCheck, i);
    }
  }

  return;
}

// deletes last letter if string is longer than 20 characters
function deleteLastChar(a) {
  encryptionCode.value = encryptionCode.value.slice(0, -1);
}

// check if char is a letter
function isLetter(a) {
  if (!((a >= 'A' && a <= 'Z') || (a >= 'a' && a <= 'z'))) {
    return false;
  } else return true;
}

function isUppercase(a) {
  if (a >= 'A' && a <= 'Z') {
    return true;
  } else {
    return false;
  }
}

function isLowercase(a) {
  if (a >= 'a' && a <= 'z') {
    return true;
  } else {
    return false;
  }
}

// delete a char in a string in given index
function deleteChar(str, index) {
  let temp = '';
  let tempIndex = 0;

  for (let i = 0; i < str.length; i++) {
    if (i == index) {
      temp[tempIndex] = str[i];
    }
  }

  // split old string at index of removed char and join rest of string together again
  str = str.split(str[index]).join(temp);

  return str;
}

// shift the given letter by [key] places in the alphabet
function shift(character, key) {
  let c;

  // get ASCII code of character
  let code = character.charCodeAt(0);
  let keycode;

  if (isUppercase(key)) {
    keycode = key.charCodeAt(0) - 65;
  } else {
    keycode = key.charCodeAt(0) - 97;
  }

  // check if uppercase letter
  if (isUppercase(character)) {
    c = String.fromCharCode(((code - 65 + keycode) % 26) + 65);
  }
  // else check if lowercase letters
  else {
    c = String.fromCharCode(((code - 97 + keycode) % 26) + 97);
  }

  return c;
}
