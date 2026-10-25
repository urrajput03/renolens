import assert from 'node:assert/strict'
import test from 'node:test'
import { calculateEstimate, formatCurrency } from '../src/domain/estimator.ts'

test('calculates flooring packs, PLN conversion, and Dutch labour separately', () => {
  const estimate = calculateEstimate('flooring', 8)

  assert.ok(estimate)
  assert.equal(estimate.areaM2, 8)
  assert.equal(estimate.packageCount, 4)
  assert.equal(estimate.purchasedAreaM2, 8.96)
  assert.equal(estimate.excessAreaM2, 0.96)
  assert.equal(estimate.materialCostPLN, 627.04)
  assert.equal(estimate.materialCostEUR, 142.69)
  assert.equal(estimate.materialCostPerM2PLN, 69.98)
  assert.equal(estimate.materialCostPerM2EUR, 15.92)
  assert.equal(estimate.labourCostLowEUR, 280)
  assert.equal(estimate.labourCostHighEUR, 600)
  assert.equal(estimate.totalLowEUR, 422.69)
  assert.equal(estimate.totalHighEUR, 742.69)
  assert.equal(estimate.fxDate, '2026-10-23')
  assert.match(estimate.materialSourceUrl, /castorama\.pl/)
  assert.match(estimate.labourSourceUrl, /click-pvc\.com/)
})

test('returns no price for categories without supported sourced inputs', () => {
  for (const renovationType of [
    'bathroom',
    'toilet',
    'kitchen',
    'painting',
  ]) {
    assert.equal(calculateEstimate(renovationType, 8), null)
  }
})

test('rejects invalid quantities for supported and unsupported categories', () => {
  for (const [renovationType, quantity] of [
    ['flooring', 0],
    ['flooring', -1],
    ['flooring', 501],
    ['toilet', 11],
    ['flooring', Number.NaN],
    ['flooring', Number.POSITIVE_INFINITY],
  ]) {
    assert.throws(
      () => calculateEstimate(renovationType, quantity),
      RangeError,
    )
  }
})

test('rejects an unsupported renovation type at runtime', () => {
  assert.throws(() => calculateEstimate('roof', 10), RangeError)
})

test('formats sourced estimate amounts to cents', () => {
  assert.match(formatCurrency(142.69), /€/)
  assert.match(formatCurrency(142.69), /142,69|142\.69/)
})
