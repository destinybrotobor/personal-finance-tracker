<?php

namespace App\Helpers;

class Utils
{
    public static function splitNames(string $fullName): array
    {
        $parts = explode(' ', $fullName);
        $firstname = $parts[0] ?? '';
        $lastname = $parts[1] ?? '';
        return [$firstname, $lastname];
    }
}
