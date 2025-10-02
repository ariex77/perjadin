<?php

namespace App\Services;

class IndonesianNumberFormatter
{
    /**
     * Convert a non-negative integer to Indonesian words (terbilang).
     */
    public static function toWords(int|float|string $number): string
    {
        $number = (int) (string) $number;
        if ($number === 0) {
            return 'Nol';
        }

        $units = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan'];
        $scales = ['', 'Ribu', 'Juta', 'Miliar', 'Triliun'];

        $resultParts = [];
        $scaleIndex = 0;

        while ($number > 0) {
            $group = $number % 1000; // three-digit group
            if ($group > 0) {
                $groupWords = self::convertHundreds($group, $units);

                // Special case: 1000 -> "seribu" (not "satu ribu")
                if ($scaleIndex === 1 && $group === 1) {
                    $groupWords = 'seribu';
                } elseif ($scaleIndex > 0) {
                    $groupWords .= ' ' . $scales[$scaleIndex];
                }

                $resultParts[] = trim($groupWords);
            }

            $number = (int) floor($number / 1000);
            $scaleIndex++;
        }

        $result = implode(' ', array_reverse($resultParts));

        // Normalize whitespace and add "rupiah" at the end
        $result = preg_replace('/\s+/', ' ', trim($result));
        return strtolower($result) . ' rupiah';
    }

    private static function convertHundreds(int $number, array $units): string
    {
        $parts = [];

        $hundreds = (int) floor($number / 100);
        $remainder = $number % 100;

        if ($hundreds > 0) {
            if ($hundreds === 1) {
                $parts[] = 'Seratus';
            } else {
                $parts[] = $units[$hundreds] . ' Ratus';
            }
        }

        if ($remainder > 0) {
            if ($remainder < 10) {
                $parts[] = $units[$remainder];
            } elseif ($remainder === 10) {
                $parts[] = 'Sepuluh';
            } elseif ($remainder === 11) {
                $parts[] = 'Sebelas';
            } elseif ($remainder < 20) {
                $parts[] = $units[$remainder - 10] . ' Belas';
            } else {
                $tens = (int) floor($remainder / 10);
                $ones = $remainder % 10;
                $tensPart = $units[$tens] . ' Puluh';
                $parts[] = $ones > 0 ? $tensPart . ' ' . $units[$ones] : $tensPart;
            }
        }

        return implode(' ', $parts);
    }
}