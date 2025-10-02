"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { addDays, format } from "date-fns"
import { id } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

function formatDate(date: Date | undefined) {
  if (!date) {
    return ""
  }
  return format(date, "dd MMMM yyyy", { locale: id })
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange) => void
  placeholder?: string
  label?: string
  className?: string
}

export function DateRangePicker({ 
  value, 
  onChange, 
  placeholder = "Pilih rentang tanggal...",
  label,
  className 
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [dateRange, setDateRange] = React.useState<DateRange>(value || { from: undefined, to: undefined })
  const [month, setMonth] = React.useState<Date | undefined>(dateRange.from)
  const [inputValue, setInputValue] = React.useState("")

  React.useEffect(() => {
    setDateRange(value || { from: undefined, to: undefined })
    updateInputValue(value || { from: undefined, to: undefined })
  }, [value])

  const updateInputValue = (range: DateRange) => {
    if (range.from && range.to) {
      setInputValue(`${formatDate(range.from)} - ${formatDate(range.to)}`)
    } else if (range.from) {
      setInputValue(`Dari ${formatDate(range.from)}`)
    } else {
      setInputValue("")
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return

    let newRange: DateRange

    if (!dateRange.from) {
      // Jika belum ada tanggal awal, set sebagai tanggal awal
      newRange = { from: date, to: undefined }
    } else if (!dateRange.to && date > dateRange.from) {
      // Jika sudah ada tanggal awal dan tanggal yang dipilih setelahnya, set sebagai tanggal akhir
      newRange = { from: dateRange.from, to: date }
    } else {
      // Reset dan mulai dari awal
      newRange = { from: date, to: undefined }
    }

    setDateRange(newRange)
    updateInputValue(newRange)
    
    // Jika sudah ada range lengkap, tutup popover
    if (newRange.from && newRange.to) {
      setOpen(false)
      onChange?.(newRange)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    // Untuk input manual, bisa diimplementasikan parsing yang lebih kompleks
    // Saat ini hanya untuk display
  }

  const clearRange = () => {
    const newRange = { from: undefined, to: undefined }
    setDateRange(newRange)
    setInputValue("")
    onChange?.(newRange)
  }

  return (
    <div className={className}>
      {label && (
        <Label htmlFor="date-range" className="px-1 mb-1 block">
          {label}
        </Label>
      )}
      <div className="relative">
        <Input
          id="date-range"
          value={inputValue}
          placeholder={placeholder}
          className="bg-background pr-20"
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        <div className="absolute top-1/2 right-2 -translate-y-1/2 flex gap-1">
          {inputValue && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearRange}
              className="h-6 w-6 p-0"
            >
              <span className="sr-only">Hapus</span>
              ×
            </Button>
          )}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                id="date-range-picker"
                variant="ghost"
                className="h-6 w-6 p-0"
              >
                <CalendarIcon className="size-3.5" />
                <span className="sr-only">Pilih rentang tanggal</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="end"
              alignOffset={-8}
              sideOffset={10}
            >
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={(range) => {
                  if (range?.from) {
                    handleDateSelect(range.from)
                  }
                }}
                numberOfMonths={2}
                month={month}
                onMonthChange={setMonth}
                className="rounded-md border"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}
