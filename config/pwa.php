<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Would you like the install button to appear on all pages?
      Set true/false
    |--------------------------------------------------------------------------
    */

    'install-button' => true,

    /*
    |--------------------------------------------------------------------------
    | PWA Manifest Configuration
    |--------------------------------------------------------------------------
    |  php artisan erag:update-manifest
    */

    'manifest' => [
        'name' => 'Finance Tracker',
        'short_name' => 'FinTRACK',
        'background_color' => '#00807F',
        'display' => 'fullscreen',
        'display_override' => ['window-controls-overlay', 'standalone', 'browser'],
        'description' => 'A finance tracking application project by Lucy Oge.',
        'theme_color' => '#00807F',
        'app_id' => 'com.finance.tracker',
        'start_url' => '/',
        'scope' => '/',
        'protocol_handlers' => [
            [
                'protocol' => 'web+fintrack',
                'url' => '/?fintrack=%s',
            ],
        ],
        'icons' => [
            [
                'src' => 'logo.png',
                'sizes' => '512x512',
                'type' => 'image/png',
            ],
            [
                'src' => 'logo.svg',
                'sizes' => 'any',
                'type' => 'image/svg+xml',
            ],
        ],
        'orientation' => 'portrait',
        'prefer_related_applications' => false,
        'categories' => ['finance', 'productivity', 'business'],
        'id' => 'com.finance.tracker',
        'lang' => 'en',
        'dir' => 'ltr',
        'related_applications' => [],
        'screenshots' => [
            [
                'src' => 'screenshots/mobile.png',
                'sizes' => '360x720',
                'type' => 'image/png',
                'label' => 'Mobile Screenshot'
            ],
            [
                'src' => 'screenshots/laptop.png',
                'sizes' => '1280x800',
                'type' => 'image/png',
                'form_factor' => 'wide',
                'label' => 'Laptop Screenshot'
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Debug Configuration
    |--------------------------------------------------------------------------
    | Toggles the application's debug mode based on the environment variable
    */

    'debug' => env('APP_DEBUG', false),

    /*
    |--------------------------------------------------------------------------
    | Livewire Integration
    |--------------------------------------------------------------------------
    | Set to true if you're using Livewire in your application to enable
    | Livewire-specific PWA optimizations or features.
    */

    'livewire-app' => false,
];
