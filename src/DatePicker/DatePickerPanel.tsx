import {addMonths, subMonths} from 'date-fns'
import React, {useMemo, useRef, useState} from 'react'
import Box from '../Box'
import {Month} from './Month'
import styled from 'styled-components'
import {get} from '../constants'
import useDatePicker from './useDatePicker'
import {ChevronLeftIcon, ChevronRightIcon} from '@primer/octicons-react'
import StyledOcticon from '../StyledOcticon'
import Button, {ButtonPrimary} from '../Button'
import type {ButtonProps} from '../Button'
import {useResizeObserver} from '../hooks/useResizeObserver'

const DatePickerPanelContainer = styled(Box)`
  align-items: stretch;
  display: flex;
  flex-direction: column;
`

const DatePickerPanelMonths = styled(Box)`
  align-items: flex-start;
  display: flex;
  flex-direction: row;
  gap: ${get('space.6')};
  padding: ${get('space.3')};
  position: relative;
`

const DatePickerPanelFooter = styled(Box)`
  align-items: flex-start;
  border-top: 1px solid;
  border-top-color: ${get('colors.border.default')};
  display: flex;

  gap: ${get('space.6')};
  padding-top: 12px;
  padding-bottom: 12px;
  padding-left: ${get('space.3')};
  padding-right: ${get('space.3')};
  flex-direction: row;
  justify-content: space-between;
  position: relative;
`

type ArrowButtonProps = {
  side: 'left' | 'right'
} & ButtonProps

const ArrowButton = styled(Button)<ArrowButtonProps>`
  position: absolute;
  width: 40px;
  height: 28px;
  top: 12px;
  ${props => `${props.side}: ${get('space.3')(props)}`};
`

export const DatePickerPanel = () => {
  const {configuration, saveValue, revertValue, currentViewingDate, goToMonth, nextMonth, previousMonth} =
    useDatePicker()
  const [multiMonthSupport, setMultiMonthSupport] = useState(true)
  const panelRef = useRef<HTMLDivElement>(null)

  const onResize = (windowEntry: ResizeObserverEntry) => {
    // Only care about the first element, we expect one element ot be watched
    const {width} = windowEntry.contentRect
    // 610 is the panel width with 2 months
    setMultiMonthSupport(width > 610)
  }
  useResizeObserver(onResize)

  const previousDisabled = useMemo(() => {
    const {minDate} = configuration
    if (!minDate) return false

    const previous = subMonths(currentViewingDate, 1)
    if (minDate.getFullYear() >= previous.getFullYear() && minDate.getMonth() > previous.getMonth()) {
      return true
    }

    return false
  }, [configuration, currentViewingDate])

  const nextDisabled = useMemo(() => {
    const {maxDate, view} = configuration
    if (!maxDate) return false

    const next = addMonths(currentViewingDate, view === '2-month' ? 2 : 1)
    if (maxDate.getFullYear() <= next.getFullYear() && maxDate.getMonth() < next.getMonth()) {
      return true
    }

    return false
  }, [configuration, currentViewingDate])

  return (
    <DatePickerPanelContainer ref={panelRef}>
      <DatePickerPanelMonths>
        <ArrowButton variant="small" side="left" onClick={previousMonth} disabled={previousDisabled}>
          <StyledOcticon icon={ChevronLeftIcon} color="fg.muted" />
        </ArrowButton>
        <Month month={currentViewingDate.getMonth()} year={currentViewingDate.getFullYear()} />
        {configuration.view === '2-month' && multiMonthSupport && (
          <Month
            month={addMonths(currentViewingDate, 1).getMonth()}
            year={addMonths(currentViewingDate, 1).getFullYear()}
          />
        )}

        <ArrowButton variant="small" side="right" onClick={nextMonth} disabled={nextDisabled}>
          <StyledOcticon icon={ChevronRightIcon} color="fg.muted" />
        </ArrowButton>
      </DatePickerPanelMonths>
      <DatePickerPanelFooter>
        <Box>
          <Button variant="small" sx={{mr: 1}} onClick={() => revertValue()}>
            Reset
          </Button>
          <Button variant="small" onClick={() => goToMonth(new Date())}>
            Today
          </Button>
        </Box>
        {configuration.confirmation && (
          <ButtonPrimary variant="small" onClick={() => saveValue()}>
            Apply
          </ButtonPrimary>
        )}
      </DatePickerPanelFooter>
    </DatePickerPanelContainer>
  )
}
