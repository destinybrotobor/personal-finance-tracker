<?php

namespace App\Traits;

trait ResponseTrait
{
    public function successResponse(string $messsage, array $data = [], int $status = 200)
    {
        return response()->json([
            'success' => true,
            'message' => $messsage,
            'body' => $data
        ], $status);
    }

    public function errorResponse(string $messsage, array $data = [], int $status = 500)
    {
        return response()->json([
            'success' => false,
            'message' => $messsage,
            'body' => $data
        ], $status);
    }
}
