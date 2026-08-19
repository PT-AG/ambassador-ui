export const Base64Helper = {
    encode(text) {
      return btoa(text);
    },
  
    decode(base64) {
      return atob(base64);
    },
  
    encodeUnicode(text) {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(text);
      return btoa(String.fromCharCode(...bytes));
    },
  
    decodeUnicode(base64) {
      const binary = atob(base64);
      const decodedBytes = new Uint8Array([...binary].map(char => char.charCodeAt(0)));
      return new TextDecoder().decode(decodedBytes);
    }
  };
