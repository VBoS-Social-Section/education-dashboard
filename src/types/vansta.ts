/** Row shape from public/data/vanstadataset.csv (VANSTA national assessment data) */
export interface VanstaRow {
  Year: string
  Province: string
  Island: string
  SchoolID: string
  School: string
  StudentID: string
  YearLevel: string
  VANSTATest: string
  DomainName: string
  Achievement: string
  'Achievement level': string
}
