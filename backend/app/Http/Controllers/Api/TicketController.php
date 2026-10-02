<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class TicketController extends Controller
{
    /**
     * Listar tickets.
     *
     * Admin y técnicos pueden consultar todos.
     * Los usuarios normales solo sus propios tickets.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        Gate::authorize('viewAny', Ticket::class);

        $roleSlug = $user?->role?->slug;

        if (!in_array($roleSlug, ['admin', 'technician', 'user'], true)) {
            return response()->json([
                'message' => 'No tienes un rol válido para consultar tickets.',
            ], 403);
        }

        $query = Ticket::with([
            'category',
            'creator',
            'assignedTechnician',
            'asset',
        ]);

        /*
         * Los usuarios normales solo pueden
         * consultar sus propios tickets.
         */
        if ($roleSlug === 'user') {
            $query->where('created_by', $user->id);
        }

        /*
         * Filtros.
         */
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        $tickets = $query
            ->latest()
            ->paginate(10);

        return response()->json($tickets);
    }


    /**
     * Mostrar un ticket.
     *
     * La autorización se realiza mediante TicketPolicy.
     * Los usuarios normales solo pueden ver sus propios tickets.
     * Admin y técnicos pueden consultar cualquier ticket.
     */
    public function show(
        Request $request,
        Ticket $ticket
    ): JsonResponse {
        $user = $request->user();

        $roleSlug = $user?->role?->slug;

        /*
         * Comprobar que el usuario tiene un rol válido.
         */
        if (!in_array($roleSlug, ['admin', 'technician', 'user'], true)) {
            return response()->json([
                'message' => 'No tienes un rol válido para consultar tickets.',
            ], 403);
        }

        /*
         * Delegar la autorización a TicketPolicy.
         */
        Gate::authorize('view', $ticket);

        /*
         * Los comentarios internos solo son visibles
         * para administradores y técnicos.
         */
        $canSeeInternalComments = in_array(
            $roleSlug,
            ['admin', 'technician'],
            true
        );

        $ticket->load([
            'category',
            'creator',
            'assignedTechnician',
            'asset',

            'comments' => function ($query) use ($canSeeInternalComments) {
                if (!$canSeeInternalComments) {
                    $query->where('internal', false);
                }

                $query->with('user');
            },

            'history' => function ($query) use ($canSeeInternalComments) {
                if (!$canSeeInternalComments) {
                    $query->where(function ($history) {
                        $history
                            ->where('action', '!=', 'comment_added')
                            ->orWhere('new_value', '!=', 'internal');
                    });
                }

                $query->with('user');
            },
        ]);

        return response()->json([
            'data' => $ticket,
        ]);
    }


    /**
     * Crear un ticket.
     *
     * created_by siempre procede del usuario autenticado.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        /*
         * Autorización mediante TicketPolicy.
         */
        Gate::authorize('create', Ticket::class);

        /*
         * IMPORTANTE:
         * No aceptamos created_by desde el cliente.
         */
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'priority' => ['required', 'in:low,medium,high,critical'],
            'category_id' => ['required', 'exists:ticket_categories,id'],
            'assigned_to' => ['nullable', 'exists:users,id'],
            'asset_id' => ['nullable', 'exists:assets,id'],
        ]);

        /*
         * El creador SIEMPRE es el usuario autenticado.
         */
        $validated['created_by'] = $user->id;

        /*
         * Generar código del ticket.
         */
        $nextNumber = Ticket::max('id') + 1;

        $validated['code'] = sprintf(
            'INC-%s-%06d',
            now()->year,
            $nextNumber
        );

        /*
         * Estado inicial.
         */
        $validated['status'] = 'open';

        /*
         * Registrar fecha de asignación
         * si se ha asignado un técnico.
         */
        if (!empty($validated['assigned_to'])) {
            $validated['assigned_at'] = now();
        }

        $ticket = Ticket::create($validated);

        /*
         * Historial: ticket creado.
         *
         * user_id = usuario autenticado.
         */
        TicketHistory::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'action' => 'created',
            'field' => null,
            'old_value' => null,
            'new_value' => 'open',
        ]);

        /*
         * Historial: técnico asignado.
         *
         * user_id = quien realizó la acción.
         * new_value = técnico asignado.
         */
        if ($ticket->assigned_to) {
            TicketHistory::create([
                'ticket_id' => $ticket->id,
                'user_id' => $user->id,
                'action' => 'assigned',
                'field' => 'assigned_to',
                'old_value' => null,
                'new_value' => (string) $ticket->assigned_to,
            ]);
        }

        $ticket->load([
            'category',
            'creator',
            'assignedTechnician',
            'asset',
            'comments.user',
            'history.user',
        ]);

        return response()->json([
            'message' => 'Ticket creado correctamente.',
            'data' => $ticket,
        ], 201);
    }


    /**
     * Actualizar un ticket.
     *
     * La autorización se realiza mediante TicketPolicy.
     *
     * El usuario que realiza la modificación
     * se obtiene SIEMPRE del token.
     */
    public function update(
        Request $request,
        Ticket $ticket
    ): JsonResponse {
        $user = $request->user();

        /*
         * TicketPolicy comprueba:
         *
         * admin       -> puede actualizar
         * technician  -> solo si el ticket está asignado a él
         * user        -> no puede actualizar
         */
        Gate::authorize('update', $ticket);

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],
            'priority' => ['sometimes', 'in:low,medium,high,critical'],
            'status' => ['sometimes', 'in:open,in_progress,resolved,closed'],
            'category_id' => ['sometimes', 'exists:ticket_categories,id'],
            'assigned_to' => ['nullable', 'exists:users,id'],
            'asset_id' => ['nullable', 'exists:assets,id'],
        ]);

        /*
         * NO aceptamos updated_by.
         *
         * Aunque el cliente mande:
         *
         * "updated_by": 1
         *
         * siempre utilizamos el usuario autenticado.
         */
        $updatedBy = $user->id;

        /*
         * Valores anteriores.
         */
        $oldStatus = $ticket->status;
        $oldPriority = $ticket->priority;
        $oldAssignedTo = $ticket->assigned_to;

        /*
         * Si cambia el técnico asignado,
         * actualizamos assigned_at.
         */
        if (
            array_key_exists('assigned_to', $validated)
            && $validated['assigned_to'] != $oldAssignedTo
        ) {
            $validated['assigned_at'] = $validated['assigned_to']
                ? now()
                : null;
        }

        /*
         * Fechas automáticas según el estado.
         */
        if (
            isset($validated['status'])
            && $validated['status'] !== $oldStatus
        ) {
            if ($validated['status'] === 'resolved') {
                $validated['resolved_at'] = now();
            }

            if ($validated['status'] === 'closed') {
                $validated['closed_at'] = now();
            }

            /*
             * Si vuelve a abierto/en progreso,
             * eliminamos las fechas de resolución/cierre.
             */
            if (
                in_array(
                    $validated['status'],
                    ['open', 'in_progress'],
                    true
                )
            ) {
                $validated['resolved_at'] = null;
                $validated['closed_at'] = null;
            }
        }

        $ticket->update($validated);

        /*
         * Historial: cambio de estado.
         */
        if (
            array_key_exists('status', $validated)
            && $validated['status'] !== $oldStatus
        ) {
            TicketHistory::create([
                'ticket_id' => $ticket->id,
                'user_id' => $updatedBy,
                'action' => 'status_changed',
                'field' => 'status',
                'old_value' => $oldStatus,
                'new_value' => $ticket->status,
            ]);
        }

        /*
         * Historial: cambio de prioridad.
         */
        if (
            array_key_exists('priority', $validated)
            && $validated['priority'] !== $oldPriority
        ) {
            TicketHistory::create([
                'ticket_id' => $ticket->id,
                'user_id' => $updatedBy,
                'action' => 'priority_changed',
                'field' => 'priority',
                'old_value' => $oldPriority,
                'new_value' => $ticket->priority,
            ]);
        }

        /*
         * Historial: cambio de técnico.
         */
        if (
            array_key_exists('assigned_to', $validated)
            && $validated['assigned_to'] != $oldAssignedTo
        ) {
            TicketHistory::create([
                'ticket_id' => $ticket->id,
                'user_id' => $updatedBy,
                'action' => 'assigned',
                'field' => 'assigned_to',
                'old_value' => $oldAssignedTo
                    ? (string) $oldAssignedTo
                    : null,
                'new_value' => $ticket->assigned_to
                    ? (string) $ticket->assigned_to
                    : null,
            ]);
        }

        /*
         * Recargar relaciones.
         */
        $ticket->load([
            'category',
            'creator',
            'assignedTechnician',
            'asset',
            'comments.user',
            'history.user',
        ]);

        return response()->json([
            'message' => 'Ticket actualizado correctamente.',
            'data' => $ticket,
        ]);
    }


    /**
     * Eliminar un ticket.
     *
     * TicketPolicy permite esta acción únicamente
     * al administrador.
     */
    public function destroy(Ticket $ticket): JsonResponse
    {
        Gate::authorize('delete', $ticket);

        $ticket->delete();

        return response()->json([
            'message' => 'Ticket eliminado correctamente.',
        ]);
    }
}