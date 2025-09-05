import { addNumber, cutGrade } from '@/lib/basic'
import { describe, expect, it } from 'vitest'

describe('Verify add number function', () => {
  it('Should return 3 when 1 + 2', () => {
    // arrange
    const value1 = 1
    const value2 = 2

    // act
    const result = addNumber(value1, value2)
    // assert
    expect(result).toBe(3)
  })
})

describe('Verify cut grade with student score', () => {
  it('Should return NaN grade when score is 101', () => {
    const score = 101
    const result = cutGrade(score)
    expect(result).toBeNaN()
  })
  it('Should return A grade when score is 81', () => {
    const score = 81
    const result = cutGrade(score)
    expect(result).toBe('A')
  })
  it('Should return B grade when score is 80', () => {
    const score = 80
    const result = cutGrade(score)
    expect(result).toBe('B')
  })
  it('Should return B grade when score is 71', () => {
    const score = 71
    const result = cutGrade(score)
    expect(result).toBe('B')
  })
  it('Should return C grade when score is 61', () => {
    const score = 61
    const result = cutGrade(score)
    expect(result).toBe('C')
  })
  it('Should return D grade when score is 60', () => {
    const score = 60
    const result = cutGrade(score)
    expect(result).toBe('D')
  })
  it('Should return D grade when score is 51', () => {
    const score = 51
    const result = cutGrade(score)
    expect(result).toBe('D')
  })
  it('Should return F grade when score is 50', () => {
    const score = 50
    const result = cutGrade(score)
    expect(result).toBe('F')
  })
  it('Should return NaN grade when score is -1', () => {
    const score = -1
    const result = cutGrade(score)
    expect(result).toBeNaN()
  })
})
