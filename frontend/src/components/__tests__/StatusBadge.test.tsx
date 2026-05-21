import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { StatusBadge } from '@/components/StatusBadge'

describe('StatusBadge', () => {
  it('renders with status="ACTIVE" (VacancyStatus) without crash', () => {
    const { container } = render(<StatusBadge status="ACTIVE" kind="vacancy" />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders with status="NEW" (ApplicationStatus) and shows i18n key', () => {
    const { getByText } = render(<StatusBadge status="NEW" kind="application" />)
    expect(getByText('applications.new')).toBeInTheDocument()
  })

  it('renders with status="ARCHIVED" without crash', () => {
    const { container } = render(<StatusBadge status="ARCHIVED" kind="vacancy" />)
    expect(container.firstChild).toBeInTheDocument()
  })
})
