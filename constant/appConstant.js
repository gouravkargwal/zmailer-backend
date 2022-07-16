Object.defineProperty(exports, "__esModule", {
  value: true,
});

if (process.env.NODE_ENV === "development") {
  exports.default = {
    baseURL: "http://localhost:5000/api/v1/mail",
    authURL: "http://localhost:3000/auth/",
  };
} else {
  exports.default = {
    baseURL: "https://mail.cashbite.in/api/v1/mail",
    authURL: "https://mail.cashbite.in/auth/",
  };
}
