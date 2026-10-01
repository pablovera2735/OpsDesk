<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Iniciar sesión.
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::with(['role', 'department'])
            ->where('email', $validated['email'])
            ->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Las credenciales son incorrectas.',
            ], 401);
        }

        if (!$user->active) {
            return response()->json([
                'message' => 'El usuario está desactivado.',
            ], 403);
        }

        // Eliminar tokens anteriores.
        $user->tokens()->delete();

        // Crear nuevo token.
        $token = $user->createToken('opsdesk-token')->plainTextToken;

        return response()->json([
            'message' => 'Inicio de sesión correcto.',
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    /**
     * Cerrar sesión.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente.',
        ]);
    }

    /**
     * Obtener usuario autenticado.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load([
            'role',
            'department',
        ]);

        return response()->json([
            'data' => $user,
        ]);
    }
}