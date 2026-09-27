export type LineItem = {
  id: string;
  testType?: string;
  description: string;
  notes: string[];
  qty: string;
  unit: string;
  rate: string;
  rateOnly: boolean;
};

export type TestType = {
  id: string;
  name: string;
  description: string;
  unit: string;
  rate: string;
};

export type Settings = {
  companyName: string;
  tagline: string;
  address: string;
  logo: string; // data URL
  contactName: string;
  hp: string;
  tel: string;
  fax: string;
  email: string;
  preparedByName: string;
  preparedByTitle: string;
  preparedByDept: string;
  preparedByCompany: string;
  signature: string; // data URL
  terms: string[];
  lastRef: string;
  testTypes: TestType[];
};

const tt = (name: string, description: string, unit: string, rate: string): TestType => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  name,
  description,
  unit,
  rate,
});

export const DEFAULT_TEST_TYPES: TestType[] = [
  tt("GPR Scanning", "Ground Penetrating Radar (GPR) scanning to locate embedded services and reinforcement", "Per Day", ""),
  tt("Rebar Detection", "Rebar detection / cover meter survey to determine rebar location and concrete cover", "Per Location", ""),
  tt("Mobilisation of Team & Equipment", "Mobilisation of Team & Equipment", "Per Trip", ""),
  tt("Issue/Preparation of Report", "Issue / Preparation of Report", "Per Report", ""),
  tt("PE Endorsement", "Professional Engineer (PE) Endorsement of Report", "Per Report", ""),
];

export type Quote = {
  id: string;
  ref: string;
  date: string;
  clientCompany: string;
  clientAddress: string;
  attn: string;
  clientEmail: string;
  clientPhone: string;
  projectTitle: string;
  introLine: string;
  items: LineItem[];
  facilities: string[];
  savedAt: string;
};

export const DEFAULT_SETTINGS: Settings = {
  companyName: "CAST Laboratories Pte Ltd",
  tagline: "Trusted For Testing and Inspection Since 1981",
  address: "17 Tuas Avenue 8 S639232",
  logo: "",
  contactName: "Murugesan",
  hp: "90172331",
  tel: "6801 6025",
  fax: "6801 6004",
  email: "muru@castlab.com.sg",
  preparedByName: "Murugesan ( Mr)",
  preparedByTitle: "Senior Manager",
  preparedByDept: "Site Department",
  preparedByCompany: "CAST Laboratories Pte Ltd",
  signature: "",
  terms: [
    "Unless otherwise stated, rates above are in Singapore Dollars, and excludes prevailing Government GST.",
    "Unless otherwise explicitly stated, scope of works does not include Professional Engineer's attendance in meetings, consultancy, analysis, interpretations, appraisals, endorsements, calculation or appearances as expert witness in Court cases",
    "Normal Working Hours:\tMonday to Friday\t09:30 to 17:30hrs\n\tSaturday\t09:30 to 12:30hrs",
    "Overtime/ Standby rate @ $55 per hr. applies valid up to 10.00pm on weekdays and 7:00pm on Saturdays\n~ Overtime/Standby rate at $85 per hour applies after 10:00pm on weekdays and 10:00pm on Saturday.",
    "For Saturday, Sundays and Public Holidays, a surcharge of S$500 will be levied on top of testing charges.",
    "Cancellation charged of $300 will be levied if the test is cancelled after our technician has arrived on the site.",
    "Client to issue official confirmation before to mobilisation to site",
    "Upon Client's instruction to mobilise to site, it would be deemed that Client has fully agreed to the rates and terms and conditions stated in this quotation.",
    "Without prejudice to and in addition to any other rights that CAST Laboratories has at law and/or in equity, CAST Laboratories shall have the right to immediately suspend any or all works and reports under this Contract without notice should there be any default in payment in excess of 60 days from date of our invoices by the Client and in such event, CAST Laboratories shall not be liable, directly nor indirectly, bear any consequential loss or liquidated damages, to the client and/ or any other person, as a result of such a suspension.",
    "Price Validity\t: 30 days from date of quotation, and thereafter to re-confirmation.",
    "Payment Terms\t: 1. $500 adv payment for COD Client/ CLPL Terms of Payment\n\t: 2. Balance upon Completion of Field work / submission of final draft report.",
    "Price quoted is subjected to prevailing Government GST.",
  ],
  lastRef: "TM/Q/2608/197R1",
  testTypes: DEFAULT_TEST_TYPES,
};

export const DEFAULT_FACILITIES = [
  "All mandatory permits & licenses  to enter and commence work is to be applied & paid for by the Client.",
  "Rates above does not include re-instatement of architectural finishes after the tests",
  "Test locations at site are to be clearly marked out by Client or Client's representative.",
  "Unobstructed access to test locations to be provided by Client",
  "Confined space safety requirments, Adequate lighting, electrical supply & water without backcharge for works to be provided by client.",
];

export const newItem = (): LineItem => ({
  id: crypto.randomUUID(),
  description: "",
  notes: [],
  qty: "1",
  unit: "",
  rate: "",
  rateOnly: false,
});

export const emptyQuote = (ref: string): Quote => ({
  id: crypto.randomUUID(),
  ref,
  date: new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }),
  clientCompany: "",
  clientAddress: "",
  attn: "",
  clientEmail: "",
  clientPhone: "",
  projectTitle: "",
  introLine: "Further to the above, we are pleased to submit our rates as follows:",
  items: [newItem()],
  facilities: [...DEFAULT_FACILITIES],
  savedAt: new Date().toISOString(),
});

export const amountOf = (it: LineItem): string => {
  if (it.rateOnly) return "Rate Only";
  const q = parseFloat(it.qty);
  const r = parseFloat(it.rate);
  if (isNaN(q) || isNaN(r)) return "";
  return (q * r).toFixed(2);
};

export const letters = "abcdefghijklmnopqrstuvwxyz".split("");
