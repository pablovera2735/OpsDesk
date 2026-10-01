<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Comprobar que el usuario tiene uno de los roles permitidos.
     */
    public function handle(
        Request $request,
        Closure $next,
        string ...$roles
    ): Response {
        $user = $request->user();

        // El usuario no está autenticado.
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // El usuario no tiene rol.
        if (!$user->role) {
            return response()->json([
                'message' => 'El usuario no tiene un rol asignado.',
            ], 403);
        }

        // Comprobar si el slug del rol está permitido.
        if (!in_array($user->role->slug, $roles, true)) {
            return response()->json([
                'message' => 'No tienes permisos para realizar esta acción.',
            ], 403);
        }

        return $next($request);
    }
}