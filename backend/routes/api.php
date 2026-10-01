<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TicketCommentController;
use App\Http\Controllers\Api\TicketController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API pública
|--------------------------------------------------------------------------
*/

Route::get('/status', function () {
    return response()->json([
        'status' => 'ok',
        'application' => 'OpsDesk API',
        'version' => '1.0',
    ]);
});

Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| API protegida con Sanctum
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Autenticación
    |--------------------------------------------------------------------------
    */

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    /*
    |--------------------------------------------------------------------------
    | Administración
    |--------------------------------------------------------------------------
    */

    Route::get('/admin-test', function () {
        return response()->json([
            'message' => 'Acceso de administrador correcto.',
        ]);
    })->middleware('role:admin');

    /*
    |--------------------------------------------------------------------------
    | Tickets - Usuario / Técnico / Administrador
    |--------------------------------------------------------------------------
    */

    Route::apiResource('tickets', TicketController::class)
        ->only([
            'index',
            'show',
            'store',
        ]);

    /*
    |--------------------------------------------------------------------------
    | Actualizar tickets - Técnico / Administrador
    |--------------------------------------------------------------------------
    */

    Route::match(['put', 'patch'], '/tickets/{ticket}', [
        TicketController::class,
        'update',
    ])
        ->middleware('role:admin,technician')
        ->name('tickets.update');

    /*
    |--------------------------------------------------------------------------
    | Eliminar tickets - Solo Administrador
    |--------------------------------------------------------------------------
    */

    Route::delete('/tickets/{ticket}', [
        TicketController::class,
        'destroy',
    ])
        ->middleware('role:admin')
        ->name('tickets.destroy');

    /*
    |--------------------------------------------------------------------------
    | Comentarios
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/tickets/{ticket}/comments',
        [TicketCommentController::class, 'store']
    )->name('tickets.comments.store');
});