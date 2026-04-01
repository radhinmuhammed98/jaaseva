/* ═══════════════════════════════════════════
   data.js — CSC Service Data
   Each link has: name, url, desc, keywords[]
   ═══════════════════════════════════════════ */

const DEFAULT_DATA = {
  {
  "Government ID Services": {
    "_icon": "🪪",
    "_color": "#1a56db",
    "Aadhaar": [
      {
        "name": "Update Aadhaar",
        "url": "https://myaadhaar.uidai.gov.in/",
        "desc": "Update name, address, DOB, mobile in Aadhaar",
        "keywords": [
          "aadhaar update",
          "adhar",
          "uid",
          "biometric",
          "address change",
          "name correction",
          "uidai"
        ]
      },
      {
        "name": "Download Aadhaar",
        "url": "https://myaadhaar.uidai.gov.in/genricDownloadAadhaar",
        "desc": "Download e-Aadhaar PDF",
        "keywords": [
          "download aadhaar",
          "eaadhaar",
          "print aadhaar",
          "adhar download"
        ]
      },
      {
        "name": "Check Aadhaar Validity",
        "url": "https://myaadhaar.uidai.gov.in/check-aadhaar-validity/en",
        "desc": "Check the validity of Aadhar",
        "keywords": [
          "aadhaar status",
          "adhar validity",
          "validity",
          "urn",
          "enrolment number",
          "track aadhaar"
        ]
      },
      {
        "name": "Order PVC Aadhar Card",
        "url": "https://myaadhaar.uidai.gov.in/",
        "desc": "Order for a PVC Aadhar card",
        "keywords": [
          "PVC adhaar",
          "seva kendra",
          "centre booking",
          "enroll"
        ]
      }
    ],
    "PAN Card": [
      {
        "name": "New PAN – NSDL",
        "url": "https://onlineservices.proteantech.in/paam/endUserRegisterContact.html",
        "desc": "Apply for fresh PAN card via NSDL (Form 49A)",
        "keywords": [
          "new pan",
          "fresh pan",
          "pan apply",
          "nsdl pan",
          "income tax id",
          "form 49a"
        ]
      },
      {
        "name": "PAN Correction – NSDL",
        "url": "https://onlineservices.proteantech.in/paam/endUserRegisterContact.html",
        "desc": "Correct name, DOB, photo on PAN via NSDL",
        "keywords": [
          "pan correction",
          "pan update",
          "pan change",
          "nsdl correction"
        ]
      },
      {
        "name": "New PAN – UTIITSL",
        "url": "https://www.pan.utiitsl.com/PAN/newA.html",
        "desc": "Apply for PAN card via UTI portal (alternate)",
        "keywords": [
          "pan uti",
          "utiitsl pan",
          "pan card uti",
          "alternate pan"
        ]
      },
      {
        "name": "PAN Correction – UTIITSL",
        "url": "https://www.pan.utiitsl.com/csf.html",
        "desc": "Correct PAN details through UTI portal",
        "keywords": [
          "pan correction uti",
          "uti correction",
          "pan name fix"
        ]
      },
      {
        "name": "Link PAN–Aadhaar/Status",
        "url": "https://eportal.incometax.gov.in/iec/foservices/#/pre-login/bl-link-aadhaar-landing",
        "desc": "Link PAN card with Aadhaar number or View status of pan card whether its linked or not",
        "keywords": [
          "link pan aadhaar",
          "pan link",
          "aadhaar pan link",
          "income tax portal",
          "status of pan card"
        ]
      },
      {
        "name": "Instant e-PAN",
        "url": "https://eportal.incometax.gov.in/iec/foservices/#/pre-login/instant-e-pan",
        "desc": "Get free e-PAN instantly using Aadhaar (for new applicants)",
        "keywords": [
          "epan",
          "instant pan",
          "free pan",
          "paperless pan",
          "aadhaar based pan"
        ]
      }
    ],
    "Voter ID": [
      {
        "name": "New Voter Registration",
        "url": "https://voters.eci.gov.in/",
        "desc": "Register as new voter – Form 6",
        "keywords": [
          "voter id",
          "new voter",
          "election card",
          "form 6",
          "eci register",
          "epic"
        ]
      },
      {
        "name": "Download e-EPIC",
        "url": "https://voters.eci.gov.in/",
        "desc": "Download digital voter ID card",
        "keywords": [
          "download voter id",
          "epic download",
          "digital voter card"
        ]
      },
      {
        "name": "Voter Details Correction",
        "url": "https://voters.eci.gov.in/",
        "desc": "Correct name, address, photo on voter card – Form 8",
        "keywords": [
          "voter correction",
          "form 8",
          "voter update",
          "address change voter"
        ]
      },
      {
        "name": "Search Voter in List",
        "url": "https://electoralsearch.eci.gov.in/",
        "desc": "Search electoral roll by name or EPIC number",
        "keywords": [
          "voter search",
          "electoral roll",
          "election list",
          "voter name search"
        ]
      },
      {
        "name": "Know Your Polling Booth",
        "url": "https://electoralsearch.eci.gov.in/",
        "desc": "Find your assigned polling station",
        "keywords": [
          "polling booth",
          "polling station",
          "where to vote"
        ]
      }
    ],
    "Passport": [
      {
        "name": "Apply Fresh Passport",
        "url": "https://www.passportindia.gov.in/psp/Apply",
        "desc": "Register and apply for a new passport",
        "keywords": [
          "passport apply",
          "new passport",
          "fresh passport",
          "travel document"
        ]
      },
      {
        "name": "Renew Passport",
        "url": "https://www.passportindia.gov.in/psp/Apply",
        "desc": "Renew expiring or expired passport",
        "keywords": [
          "passport renew",
          "renew passport",
          "expired passport",
          "passport renewal"
        ]
      },
      {
        "name": "Passport Correction",
        "url": "https://www.passportindia.gov.in/psp/Apply",
        "desc": "Correct name, DOB or address in passport",
        "keywords": [
          "passport correction",
          "passport name change",
          "passport update",
          "passport reissue"
        ]
      },
      {
        "name": "Passport Appointment Availability",
        "url": "https://www.passportindia.gov.in/psp/checkAppointmentAvailibility",
        "desc": "check Passport appointment availability Seva Kendra or PSK",
        "keywords": [
          "passport appointment",
          "psk appointment",
          "passport seva",
          "book passport slot"
        ]
      },
      {
        "name": "Track Passport Status",
        "url": "https://www.passportindia.gov.in/psp/trackApplicationService",
        "desc": "Track passport application and dispatch status",
        "keywords": [
          "passport status",
          "track passport",
          "file number",
          "passport dispatch"
        ]
      }
    ]
  },
  "eDistrict Kerala": {
    "_icon": "🏛️",
    "_color": "#059669",
    "Income & Community": [
      {
        "name": "Income Certificate",
        "url": "https://edistrict.kerala.gov.in/",
        "desc": "Apply for annual income certificate from Tahsildar",
        "keywords": [
          "income certificate",
          "income proof",
          "tahsildar income",
          "annual income"
        ]
      },
      {
        "name": "Community Certificate",
        "url": "https://edistrict.kerala.gov.in/",
        "desc": "Caste/Community certificate for OBC, SC, ST",
        "keywords": [
          "community certificate",
          "caste certificate",
          "obc certificate",
          "sc st certificate",
          "jati surekshanam"
        ]
      },
      {
        "name": "Non-Creamy Layer Certificate",
        "url": "https://edistrict.kerala.gov.in/",
        "desc": "Non-creamy layer OBC certificate for reservations",
        "keywords": [
          "non creamy layer",
          "ncl certificate",
          "obc ncl",
          "creamy layer",
          "noncreamy"
        ]
      }
    ],
    "Residence & Land": [
      {
        "name": "Residence Certificate",
        "url": "https://edistrict.kerala.gov.in/",
        "desc": "Proof of residential address from Village Office",
        "desc2": "Also called Domicile Certificate",
        "keywords": [
          "residence certificate",
          "address proof",
          "domicile",
          "living proof",
          "residential"
        ]
      },
      {
        "name": "Possession Certificate",
        "url": "https://edistrict.kerala.gov.in/",
        "desc": "Proof of land possession from Village Office",
        "keywords": [
          "possession certificate",
          "land possession",
          "property possession",
          "pokkuvaravu"
        ]
      },
      {
        "name": "Nativity Certificate",
        "url": "https://edistrict.kerala.gov.in/",
        "desc": "Certificate of origin / native place in Kerala",
        "keywords": [
          "nativity certificate",
          "native place",
          "origin certificate",
          "born kerala"
        ]
      },
      {
        "name": "No Dues Certificate",
        "url": "https://edistrict.kerala.gov.in/",
        "desc": "Certificate confirming no government dues pending",
        "keywords": [
          "no dues",
          "dues certificate",
          "clearance certificate",
          "noc"
        ]
      }
    ],
    "Education & Other": [
      {
        "name": "Solvency Certificate",
        "url": "https://edistrict.kerala.gov.in/",
        "desc": "Financial solvency proof for tenders and contracts",
        "keywords": [
          "solvency certificate",
          "financial certificate",
          "solvency proof",
          "tender certificate"
        ]
      },
      {
        "name": "Life Certificate",
        "url": "https://edistrict.kerala.gov.in/",
        "desc": "Jeevan Pramaan / life certificate for pensioners",
        "keywords": [
          "life certificate",
          "jeevan pramaan",
          "pension certificate",
          "alive certificate"
        ]
      },
      {
        "name": "Check Application Status",
        "url": "https://edistrict.kerala.gov.in/",
        "desc": "Track status of any eDistrict application",
        "keywords": [
          "application status",
          "track application",
          "edistrict status",
          "certificate status"
        ]
      }
    ]
  },
  "Taxes & Revenue": {
    "_icon": "🏠",
    "_color": "#7c3aed",
    "Land Tax": [
      {
        "name": "Pay Land Tax",
        "url": "https://revenue.kerala.gov.in/",
        "desc": "Pay land tax / property revenue to Village Office",
        "keywords": [
          "land tax",
          "bhoomi tax",
          "property tax land",
          "village office tax",
          "revenue",
          "bhumi"
        ]
      },
      {
        "name": "Land Tax Receipt",
        "url": "https://revenue.kerala.gov.in/",
        "desc": "Download land tax payment receipt",
        "keywords": [
          "land tax receipt",
          "tax receipt download",
          "bhoomi tax receipt"
        ]
      },
      {
        "name": "Land Records (Thandaper)",
        "url": "https://erekha.kerala.gov.in/",
        "desc": "View land ownership records (Thandaper Register)",
        "keywords": [
          "thandaper",
          "land record",
          "erekha",
          "ownership record",
          "survey number"
        ]
      }
    ],
    "Property Tax (Local Body)": [
      {
        "name": "Quick-Pay Property Tax",
        "url": "https://ksmart.lsgkerala.gov.in/ui/property-tax/quick-pay-tax/citizen",
        "desc": "Pay building property tax to Gram Panchayat",
        "keywords": [
          "property tax",
          "building tax",
          "panchayat tax",
          "house tax",
          "lsg"
        ]
      }
    ],
    "Registration Dept(Kudikkidam)": [
      {
        "name": "Encumbrance Certificate",
        "url": "https://pearl.registration.kerala.gov.in/index.php",
        "desc": "Kudikkidam Certificate",
        "keywords": [
          "Kudikkidam Certificate"
        ]
      }
    ]
  },
  "Parivahan Services": {
    "_icon": "🚗",
    "_color": "#d97706",
    "Driving Licence": [
      {
        "name": "License Related Services",
        "url": "https://sarathi.parivahan.gov.in/",
        "desc": "All Services related to License",
        "keywords": [
          "dl status",
          "driving status",
          "sarathi status",
          "track dl"
        ]
      }
    ],
    "Vehicle Registration": [
      {
        "name": "Vehicle Related Services",
        "url": "https://vahan.parivahan.gov.in/vahanservice/vahan/ui/statevalidation/homepage.xhtml?statecd=Mzc2MzM2MzAzNjY0MzIzODM3NjIzNjY0MzY2MjM3NGI0Yw==",
        "desc": "Every services related with vehicle RC",
        "keywords": [
          "Vehicle related"
        ]
      }
    ]
  },
  "Ration Card": {
    "_icon": "🌾",
    "_color": "#dc2626",
    "Apply & Modify": [
      {
        "name": "Ration Card Services",
        "url": "https://ecitizen.civilsupplieskerala.gov.in/index.php/c_login",
        "desc": "Every services related with ration card",
        "keywords": [
          "new ration card",
          "ration apply",
          "civil supplies",
          "bpl card",
          "apl card",
          "phh card",
          "food card"
        ]
      }
    ]
  },
  "Health Services": {
    "_icon": "🏥",
    "_color": "#db2777",
    "Ayushman Bharat": [
      {
        "name": "Check PMJAY Eligibility",
        "url": "https://beneficiary.nha.gov.in/",
        "desc": "Check if family is eligible for PM-JAY health insurance",
        "keywords": [
          "ayushman bharat",
          "pmjay",
          "health insurance",
          "5 lakh insurance",
          "pm jan arogya"
        ]
      },
      {
        "name": "Get Ayushman Card",
        "url": "https://beneficiary.nha.gov.in/",
        "desc": "Download or print Ayushman Bharat health card",
        "keywords": [
          "ayushman card",
          "health card",
          "pmjay card",
          "golden card"
        ]
      },
      {
        "name": "Find Empanelled Hospital",
        "url": "https://hospitals.pmjay.gov.in/",
        "desc": "Find nearest PMJAY empanelled hospital",
        "keywords": [
          "hospital list",
          "empanelled hospital",
          "pmjay hospital",
          "free treatment hospital"
        ]
      }
    ],
    "e-Sanjeevani": [
      {
        "name": "Online OPD Consultation",
        "url": "https://esanjeevaniopd.in/",
        "desc": "Free online doctor consultation via e-Sanjeevani",
        "keywords": [
          "esanjeevani",
          "online doctor",
          "tele medicine",
          "telemedicine",
          "online opd",
          "video doctor"
        ]
      }
    ]
  },
  "Bill Payments": {
    "_icon": "💡",
    "_color": "#0891b2",
    "Electricity": [
      {
        "name": "KSEB Quick Pay",
        "url": "https://wss.kseb.in/selfservices/quickpay",
        "desc": "Pay KSEB bill without login using consumer number",
        "keywords": [
          "kseb quick pay",
          "quick electricity pay",
          "consumer number pay"
        ]
      },
      {
        "name": "KSEB Related other services",
        "url": "https://wss.kseb.in/selfservices/",
        "desc": "Apply for new electricity connection",
        "keywords": [
          "new electricity",
          "new connection",
          "kseb connection",
          "electricity apply"
        ]
      }
    ],
    "Water": [
      {
        "name": "JALA-NIDHI (Water Bill)",
        "url": "https://www.smpay.in/login.php",
        "desc": "Pay  water bill",
        "keywords": [
          "water bill",
          "water authority",
          "water payment",
          "kerala water",
          "smpay"
        ]
      }
    ],
    "Gas": [
      {
        "name": "Book LPG Cylinder",
        "url": "https://www.mylpg.in/",
        "desc": "Book refill for Indane, HP, Bharat gas",
        "keywords": [
          "lpg book",
          "gas cylinder",
          "cooking gas",
          "refill gas",
          "indane",
          "hp gas",
          "bharat gas"
        ]
      },
      {
        "name": "Check Subsidy Status",
        "url": "https://www.mylpg.in/",
        "desc": "Check LPG subsidy and PAHAL status",
        "keywords": [
          "lpg subsidy",
          "gas subsidy",
          "pahal",
          "dbtl",
          "gas subsidy status"
        ]
      }
    ]
  },
  "Digital Services": {
    "_icon": "💻",
    "_color": "#0f766e",
    "DigiLocker": [
      {
        "name": "DigiLocker Sign Up",
        "url": "https://digilocker.gov.in/",
        "desc": "Create DigiLocker account to store all documents",
        "keywords": [
          "digilocker",
          "digital locker",
          "document store",
          "online documents",
          "digi locker register"
        ]
      },
      {
        "name": "Access Documents",
        "url": "https://digilocker.gov.in/",
        "desc": "Access Aadhaar, PAN, RC, marks sheet digitally",
        "keywords": [
          "digilocker access",
          "digital documents",
          "online certificate",
          "download certificate"
        ]
      }
    ],
    "UMANG": [
      {
        "name": "UMANG App / Portal",
        "url": "https://web.umang.gov.in/",
        "desc": "Access 1500+ government services through UMANG",
        "keywords": [
          "umang",
          "government app",
          "epf umang",
          "multi service portal"
        ]
      }
    ],
    "eSign": [
      {
        "name": "eSign Document",
        "url": "https://esign.gov.in/",
        "desc": "Digitally sign documents using Aadhaar OTP",
        "keywords": [
          "esign",
          "digital sign",
          "aadhaar sign",
          "document signing",
          "electronic signature"
        ]
      }
    ]
  }
}
};
