<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketComment;
use App\Models\TicketHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketCommentController extends Controller
{
    /**
     * Crear un comentario en un ticket.
     */
    public function store(Request $request, Ticket $ticket): JsonResponse
    {
        $user = $request->user();

        // Comprobar que el usuario está autenticado.
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:5000'],
            'internal' => ['sometimes', 'boolean'],
        ]);

        $internal = $validated['internal'] ?? false;

        /*
        |--------------------------------------------------------------------------
        | Comentarios internos
        |--------------------------------------------------------------------------
        |
        | Solo administradores y técnicos pueden crear comentarios internos.
        |
        */

        $roleSlug = $user->role?->slug;

        $canCreateInternalComment = in_array(
            $roleSlug,
            ['admin', 'technician'],
            true
        );

        if ($internal && !$canCreateInternalComment) {
            return response()->json([
                'message' => 'No tienes permisos para crear comentarios internos.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Crear comentario
        |--------------------------------------------------------------------------
        |
        | El user_id SIEMPRE se obtiene del usuario autenticado.
        | Nunca confiamos en un user_id enviado por el cliente.
        |
        */

        $comment = TicketComment::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'message' => $validated['message'],
            'internal' => $internal,
        ]);

        /*
        |--------------------------------------------------------------------------
        | Registrar historial
        |--------------------------------------------------------------------------
        */

        TicketHistory::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'action' => 'comment_added',
            'field' => 'comment',
            'old_value' => null,
            'new_value' => $internal
                ? 'internal'
                : 'public',
        ]);

        $comment->load('user');

        return response()->json([
            'message' => 'Comentario añadido correctamente.',
            'data' => $comment,
        ], 201);
    }
}