export const USER_TOKEN_KEY = 'USER_TOKEN_KEY';
export const FCM_TOKEN_KEY = 'FCM_TOKEN_KEY';
export const APP_THEME = 'APP_THEME';
export const SELECTED_LANGUAGE = 'SELECTED_LANGUAGE';
/** API origin (no `/api` segment). Paths are built as `${BASE_URL}v1/...` in AppOperation — same as web. */
export const BASE_URL = 'https://backend.zillionexchange.com/';
export const IMAGE_BASE_URL = 'https://backend.zillionexchange.com/';

/**
 * Optional origin for relative `apk` paths from `user/getApk`. Leave empty to use `BASE_URL`.
 * Set this if APKs are served from another host/CDN while the API stays on `BASE_URL`.
 * The API can also return a full `https://…` URL in `data.apk` — that is used as-is.
 */
export const APK_BASE_URL = '';

/** Spot / futures chart WebView host (no trailing slash). Same paths as before: `/chart/{theme}/`, `/futures-chart/{theme}/`. */
export const CHART_WEB_ORIGIN = 'https://zillionexchange.com';

/**
 * Guest social auth path segments. AppOperation builds the final URL to match web `AuthService`:
 * POST `${BASE_URL}user/third-party-signup` (no `/v1/` — same as zillion_exchange_web).
 */
export const GUEST_THIRD_PARTY_SIGNUP_PATH = 'user/third-party-signup';
export const GUEST_THIRD_PARTY_LOGIN_PATH = 'user/third-party-login';

export const CAPTCHA_KEY = '6Ld7dJcrAAAAAK-0IDXac7t8X-0NJzBOm6IhWae3';
export const placeHolderText = {
  userName: 'Phone Number',
  email: 'Enter Email',
  password: 'Enter Your Password',
  newPassword: 'Enter New Password',
  confirmNewPassword: 'Re-enter New Password',
  otp: 'Enter Verification Code',
  signUpPassword: 'Enter Password',
  signUPConfirmPassword: 'Re-enter Password',
  referCode: 'Invitation Code (Optional)',
  firstName: 'Enter First Name ',
  lastName: 'Enter Last Name ',
  code: 'Enter Code',
  search: 'Search for markets',
  wallet: 'Wallet Address',
  amount: 'Amount',
  amountInr: 'Enter Amount',
  transaction: 'Enter Transaction Number',
  kycType: 'Select KYC Type',
  country: 'Select Country',
  middleName: 'Enter Middle Name',
  common: 'XYZ',
  dob: 'DD-MM-YYYY',
  docType: 'Select Type',
  dateRange: 'Please Select a Date Range',
  message: 'Message (Optional)',
  accountType: 'Select Account Type',
  bank: 'Enter Bank Name',
  holder: 'Enter Name',
  number: 'Enter Account Number',
  ifsc: 'Enter IFSC Code/SWIFT Code',
  branch: 'Enter Branch Name',
  kgin: 'Enter Number',
  empty: '',
  _userName: 'Email or Phone Number',
};
export const errorText = {
  userName: 'Please Provide Valid Phone Number',
  password: 'Please Provide Valid Password',
  otp: 'Please Provide Valid Verification Code',
  passwordMismatch: 'Password Not Match',
  passwordRegex:
    'New password Must have at least 8 characters and one Uppercase one lowercase and a special character and number',
  oldPasswordRegex:
    'Password Must have at least 8 characters and one Uppercase one lowercase and a special character and number',
  firstName: 'Please Enter Valid First Name',
  lastName: 'Please Enter Valid Last Name',
  cameraPermission: 'permission to use camera is not granted',
  galleryPermission: 'permission to use gallery is not granted',
  currency: 'Already Selected',
  wallet: 'Please Provide Valid Wallet Address',
  amount: 'Amount is not correct',
  transaction: 'Please Provide Valid Transaction Number',
  proof: 'Please Provide Valid Proof of Deposit',
  country: 'Please Provide Valid Country Name',
  kycType: 'Please Provide Valid Kyc Type',
  dob: 'Please Provide Valid Date of Birth',
  address: 'Please Provide Valid Address',
  state: 'Please Provide Valid State Name',
  city: 'Please Provide Valid City Name',
  pin: 'Please Provide Valid Pin Code',
  pan: 'Please Provide Valid PAN Number',
  confirmPan: 'Please Provide Valid Confirm PAN Number',
  panImage: 'Please Provide Valid PAN Image',
  docType: 'Please Select Valid Doucument Type',
  aadhar: 'Please Provide Valid Aadhar Number',
  license: 'Please Provide Valid Driving License',
  docNumber: 'Please Provide Valid Document Number',
  docFront: "Please Upload Valid Image of Document's Front Side",
  docBack: "Please Upload Valid Image of Document's Back Side",
  selfie: 'Please Upload Valid Selfie',
  tradeReport: 'Please select a duration first',
  accountType: ' Please Provide Valid Fiat Type',
  bank: ' Please Provide Valid Bank Name',
  holder: ' Please Provide Valid Account Holder Name',
  number: ' Please Provide Valid Account Number',
  ifsc: ' Please Provide Valid IFSC Code',
  branch: ' Please Provide Valid Branch Name',
  passbook: 'Please Provide Valid Image of Bank Proof',
  kgin: 'Please Provide Valid KGIN Number',
  temp: 'Deposit not available for this currency',
  email: 'Please Provide Valid Email',
  _userName: 'Please Provide Valid Email or Phone Number',
  terms: 'Please agree to out terms of use',
};

export const titleText = {
  firstName: 'First Name*',
  lastName: 'Last Name*',
  phone: 'Phone Number',
  code: 'Email Verification Code',
  password: 'Current Password',
  newPassword: 'New Password',
  confirmPassword: 'Confirm New Password',
  wallet: 'Address',
  amount: 'Amount',
  country: 'Country',
  kycType: 'Type of KYC',
  middleName: 'Middle Name',
  address: 'Address*',
  state: 'State*',
  city: 'City*',
  pin: 'Pin Code*',
  dob: 'Date of Birth*',
  gender: 'Gender*',
  pan: 'PAN Number*',
  confirmPan: 'Re-Enter PAN Number',
  docType: 'Select Document Type*',
  accountType: 'Account Type',
  bank: 'Bank Name',
  holder: 'Account Holder Name',
  number: 'Account Number',
  ifsc: 'IFSC Code/SWIFT Code',
  branch: 'Branch Name',
  kgin: 'K Global Identification Number',
  price: 'Price',
  total: 'Total',
};
