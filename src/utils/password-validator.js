export class PasswordValidator {
    static validate(password) {
        if (!password) return "Kata sandi tidak boleh kosong.";
        if (password.length < 8) return "Kata sandi harus minimal 8 karakter.";

        let hasUpperCase = /[A-Z]/.test(password);
        let hasLowerCase = /[a-z]/.test(password);
        let hasNumber = /[0-9]/.test(password);
        let hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
            return "Kata sandi harus mengandung kombinasi huruf besar, huruf kecil, angka, dan karakter khusus.";
        }

        return null;
    }
}
