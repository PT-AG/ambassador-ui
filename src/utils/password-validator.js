export const PasswordValidator = {
  validate(password) {

    var validationMessage = "";

    // Validasi null atau kosong
    if (password == null || password.trim() === "" || password === undefined) {
      validationMessage += "Password harus diisi.\n";
    } else {
      // Validasi panjang minimal
      if (password.length < 8) {
        validationMessage += "Password minimal harus 8 karakter.\n";
      }

      // Validasi kompleksitas
      if (!/[A-Z]/.test(password)) {
        validationMessage += "Password harus mengandung minimal satu huruf kapital.\n";
      }
      if (!/[a-z]/.test(password)) {
        validationMessage += "Password harus mengandung minimal satu huruf kecil.\n";
      }
      if (!/[0-9]/.test(password)) {
        validationMessage += "Password harus mengandung minimal satu angka.\n";
      }
      if (!/[!@#$%^&*(),.?":;{}|<>]/.test(password)) {
        validationMessage += "Password harus mengandung minimal satu karakter spesial.\n";
      }

      // Validasi karakter tidak valid (opsional)
      if (/[\u0000-\u001F]/.test(password)) {
        validationMessage += "Password mengandung karakter tidak valid.\n";
      }

      // Validasi karakter yang berulang lebih dari 3 kali berturut-turut
      if (/(.)\1{2,}/.test(password)) {
        validationMessage += "Password tidak boleh mengandung karakter yang sama 3 kali berturut-turut.\n";
      }

      // Validasi hanya huruf atau hanya angka
      // if (/^[a-zA-Z]+$/.test(password)) {
      //   return "Password tidak boleh hanya huruf.";
      // }

      // if (/^\d+$/.test(password)) {
      //   return "Password tidak boleh hanya angka.";
      // }
    }

    return validationMessage === "" ? null : validationMessage; // Password valid
  }
};
