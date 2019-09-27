import Milestone from '@/components/Milestone.vue'

describe('Milestone', () => {
  it('returns valid options for major version (short notation)', () => {
    expect(Milestone.methods.getSuggestedMilestoneTitles('3')).toEqual([
      '3.0.1',
      '3.1.0',
      '4.0.0',
    ])
  })
  it('returns valid options for major version (medium notation)', () => {
    expect(Milestone.methods.getSuggestedMilestoneTitles('3.0')).toEqual([
      '3.0.1',
      '3.1.0',
      '4.0.0',
    ])
  })
  it('returns valid options for major version (long notation)', () => {
    expect(Milestone.methods.getSuggestedMilestoneTitles('3.0.0')).toEqual([
      '3.0.1',
      '3.1.0',
      '4.0.0',
    ])
  })

  it('returns valid options for minor version (short notation)', () => {
    expect(Milestone.methods.getSuggestedMilestoneTitles('3.1')).toEqual([
      '3.1.1',
      '3.2.0',
      '4.0.0',
    ])
  })
  it('returns valid options for major version (long notation)', () => {
    expect(Milestone.methods.getSuggestedMilestoneTitles('3.1.0')).toEqual([
      '3.1.1',
      '3.2.0',
      '4.0.0',
    ])
  })

  it('returns valid options for patch version', () => {
    expect(Milestone.methods.getSuggestedMilestoneTitles('3.1.1')).toEqual([
      '3.1.2',
      '3.2.0',
      '4.0.0',
    ])
  })
})
