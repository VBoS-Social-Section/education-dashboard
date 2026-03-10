#!/usr/bin/env node
/**
 * Generates one CSV per year from source files in data/.
 * Sources: court_metrics, gender_analysis, case_outcomes,
 *   case_workload_by_type, pending_by_type, pending_listed_status,
 *   dv_filings, location_workload, charge_orders, coa_outcomes
 * Output: public/data/*.csv, public/data/years.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const DATA_DIR = path.join(ROOT, 'data')

const COURT_METRIC_UNITS = {
  Filings: '',
  Disposals: '',
  ClearanceRate: '%',
  Pending: '',
  PDR: '',
  PendingAge: '%',
  TimelinessCriminal: 'days',
  TimelinessCivil: 'days',
  AttendanceCriminal: '%',
  AttendanceCivil: '%',
  AttendanceEnforcement: '%',
  Productivity: '',
  ReservedJudgments: '',
}

function parseCSV(content) {
  const lines = content.trim().split('\n')
  const headers = lines[0].split(',').map((h) => h.trim())
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim())
    const row = {}
    headers.forEach((h, i) => (row[h] = values[i] ?? ''))
    return row
  })
}

function readCSV(filename) {
  const p = path.join(DATA_DIR, filename)
  return parseCSV(fs.readFileSync(p, 'utf-8'))
}

function writeYearlyCSV(year, rows) {
  const header = 'Court,Year,Metric,Value,Unit'
  const content = [header, ...rows.map((r) => [r.Court, r.Year, r.Metric, r.Value, r.Unit].join(','))].join('\n')
  const outPath = path.join(ROOT, 'public', 'data', `${year}.csv`)
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, content + '\n')
}

const genderData = readCSV('gender_analysis.csv')
const courtMetrics = readCSV('court_metrics.csv')
const caseOutcomes = readCSV('case_outcomes.csv')
const caseWorkloadByType = readCSV('case_workload_by_type.csv')
const pendingByType = readCSV('pending_by_type.csv')
const pendingListedStatus = readCSV('pending_listed_status.csv')
const dvFilings = readCSV('dv_filings.csv')
const locationWorkload = readCSV('location_workload.csv')
const chargeOrders = readCSV('charge_orders.csv')
const coaOutcomes = readCSV('coa_outcomes.csv')

const years = [...new Set([
  ...courtMetrics.map((r) => r.Year),
  ...caseWorkloadByType.map((r) => r.Year),
])].filter(Boolean).map(Number).sort((a, b) => a - b)

for (const year of years) {
  const rows = []

  // Court metrics (includes PendingAge, ReservedJudgments)
  for (const r of courtMetrics.filter((x) => x.Year === String(year))) {
    const court = r.Court
    for (const [col, unit] of Object.entries(COURT_METRIC_UNITS)) {
      const val = r[col]
      if (val === undefined || val === '' || String(val).toLowerCase() === 'na') continue
      rows.push({ Court: court, Year: String(year), Metric: col, Value: val, Unit: unit })
    }
  }

  // Gender
  for (const r of genderData.filter((x) => x.Year === String(year))) {
    const court = r.Court
    if (r.Male) rows.push({ Court: court, Year: String(year), Metric: 'Gender_Male', Value: r.Male, Unit: '%' })
    if (r.Female) rows.push({ Court: court, Year: String(year), Metric: 'Gender_Female', Value: r.Female, Unit: '%' })
  }

  // Case outcomes
  for (const r of caseOutcomes.filter((x) => x.Year === String(year))) {
    const court = r.Court
    const prefix = r.CaseType + '_'
    for (const col of ['Guilty', 'NotGuilty', 'Withdrawn', 'Committed', 'Dismissed']) {
      const val = r[col]
      if (val === undefined || val === '' || String(val).toLowerCase() === 'na') continue
      rows.push({ Court: court, Year: String(year), Metric: prefix + col, Value: val, Unit: '%' })
    }
  }

  // Case workload by type
  for (const r of caseWorkloadByType.filter((x) => x.Year === String(year))) {
    const court = r.Court
    const ct = r.CaseType
    if (r.Filings) rows.push({ Court: court, Year: String(year), Metric: `Workload_${ct}_Filings`, Value: r.Filings, Unit: '' })
    if (r.Disposals) rows.push({ Court: court, Year: String(year), Metric: `Workload_${ct}_Disposals`, Value: r.Disposals, Unit: '' })
    if (r.ClearanceRate) rows.push({ Court: court, Year: String(year), Metric: `Workload_${ct}_ClearanceRate`, Value: r.ClearanceRate, Unit: '%' })
  }

  // Pending by type
  for (const r of pendingByType.filter((x) => x.Year === String(year))) {
    const court = r.Court
    const ct = r.CaseType
    if (r.Pending) rows.push({ Court: court, Year: String(year), Metric: `Pending_${ct}`, Value: r.Pending, Unit: '' })
    if (r.PctOfTotal) rows.push({ Court: court, Year: String(year), Metric: `Pending_${ct}_Pct`, Value: r.PctOfTotal, Unit: '%' })
  }

  // Pending listed status
  for (const r of pendingListedStatus.filter((x) => x.Year === String(year))) {
    const court = r.Court
    if (r.WithFutureListing_Pct) rows.push({ Court: court, Year: String(year), Metric: 'Pending_WithFutureListing', Value: r.WithFutureListing_Pct, Unit: '%' })
    if (r.UnderCaseMgmt_Pct) rows.push({ Court: court, Year: String(year), Metric: 'Pending_UnderCaseMgmt', Value: r.UnderCaseMgmt_Pct, Unit: '%' })
    if (r.NoFutureDate_Pct) rows.push({ Court: court, Year: String(year), Metric: 'Pending_NoFutureDate', Value: r.NoFutureDate_Pct, Unit: '%' })
  }

  // DV filings
  for (const r of dvFilings.filter((x) => x.Year === String(year))) {
    const court = r.Court
    if (r.Filings) rows.push({ Court: court, Year: String(year), Metric: 'DV_Filings', Value: r.Filings, Unit: '' })
    if (r.Disposals) rows.push({ Court: court, Year: String(year), Metric: 'DV_Disposals', Value: r.Disposals, Unit: '' })
    if (r.ClearanceRate) rows.push({ Court: court, Year: String(year), Metric: 'DV_ClearanceRate', Value: r.ClearanceRate, Unit: '%' })
  }

  // Location workload
  for (const r of locationWorkload.filter((x) => x.Year === String(year))) {
    const court = r.Court
    const prov = r.Province.replace(/\s/g, '_')
    if (r.Filings) rows.push({ Court: court, Year: String(year), Metric: `Location_${prov}_Filings`, Value: r.Filings, Unit: '' })
    if (r.PctOfTotal) rows.push({ Court: court, Year: String(year), Metric: `Location_${prov}_Pct`, Value: r.PctOfTotal, Unit: '%' })
  }

  // Charge orders
  for (const r of chargeOrders.filter((x) => x.Year === String(year))) {
    const court = r.Court
    if (r.ChargeOrders) rows.push({ Court: court, Year: String(year), Metric: 'ChargeOrders', Value: r.ChargeOrders, Unit: '' })
  }

  // CoA outcomes
  for (const r of coaOutcomes.filter((x) => x.Year === String(year))) {
    const court = r.Court
    const ct = r.CaseType
    if (r.Dismissed) rows.push({ Court: court, Year: String(year), Metric: `CoA_${ct}_Dismissed`, Value: r.Dismissed, Unit: '%' })
    if (r.Allowed) rows.push({ Court: court, Year: String(year), Metric: `CoA_${ct}_Allowed`, Value: r.Allowed, Unit: '%' })
    if (r.Withdrawn) rows.push({ Court: court, Year: String(year), Metric: `CoA_${ct}_Withdrawn`, Value: r.Withdrawn, Unit: '%' })
  }

  writeYearlyCSV(year, rows)
  console.log(`Wrote public/data/${year}.csv (${rows.length} rows)`)
}

const manifestPath = path.join(ROOT, 'public', 'data', 'years.json')
const lastUpdated = new Date().toISOString().slice(0, 10)
fs.writeFileSync(manifestPath, JSON.stringify({ years, lastUpdated }))
console.log(`Wrote public/data/years.json (${years.join(', ')}), lastUpdated: ${lastUpdated}`)
